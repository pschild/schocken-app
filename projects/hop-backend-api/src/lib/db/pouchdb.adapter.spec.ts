import PouchDB from 'pouchdb';
import PouchAdapterMemory from 'pouchdb-adapter-memory';
import { TestBed } from '@angular/core/testing';
import { PouchDbAdapter } from './pouchdb.adapter';
import { ENV } from '../hop-backend-api.module';
import { of, Observable } from 'rxjs';
import { EntityType } from '../entity';
import { PlayerDto } from '../player';
import { Injectable } from '@angular/core';
import { GetResponse } from './model/get-response.model';
PouchDB.plugin(PouchAdapterMemory);

@Injectable()
class MockPouchDbAdapter extends PouchDbAdapter {
  initialize(): void {
    this.instance = new PouchDB('source', { adapter: 'memory' });
  }
}

describe('PouchDbAdapter', () => {

  describe('PouchDbAdapter', () => {
    let adapter: PouchDbAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: PouchDbAdapter, useClass: MockPouchDbAdapter },
          { provide: ENV, useValue: {} }
        ]
      });

      adapter = TestBed.get(PouchDbAdapter);
      adapter.initialize();
    });

    afterEach(async () => {
      await adapter.destroy();
    });

    it('should be created', () => {
      expect(adapter).toBeTruthy();
    });

    it('should create and read an entity', async () => {
      await adapter.create({
        _id: 'PLAYER-abc',
        type: EntityType.PLAYER,
        name: 'Philippe',
        active: true,
        registered: new Date()
      } as PlayerDto);

      const player = await adapter.getOne('PLAYER-abc');
      expect(player).toEqual({
        _id: 'PLAYER-abc',
        type: EntityType.PLAYER,
        name: 'Philippe',
        active: true,
        registered: jasmine.any(String),
        _rev: jasmine.stringMatching(/^1-[0-9a-z]+$/)
      });
    });

    it('should create and read entities', async (done) => {
      await adapter.create({
        _id: 'PLAYER-abc',
        type: EntityType.PLAYER,
        name: 'Philippe',
        active: true,
        registered: new Date()
      } as PlayerDto);

      await adapter.create({
        _id: 'PLAYER-def',
        type: EntityType.PLAYER,
        name: 'Hans',
        active: false,
        registered: new Date()
      } as PlayerDto);

      adapter.getAll('PLAYER').then((response: GetResponse<PlayerDto>) => {
        expect(response.rows.length).toBe(2);
        done();
      });
    });

    it('should create and remove an entity', async () => {
      await adapter.create({
        _id: 'PLAYER-abc',
        type: EntityType.PLAYER,
        name: 'Philippe',
        active: true,
        registered: new Date()
      } as PlayerDto);

      expect((await adapter.getAll('PLAYER')).rows.length).toBe(1);

      const player = await adapter.getOne('PLAYER-abc');
      await adapter.remove(player as PlayerDto);
      expect((await adapter.getAll('PLAYER')).rows.length).toBe(0);
    });

    it('should generate a valid UUID for an EntityType', () => {
      const result = adapter.generateId(EntityType.PLAYER);

      expect(result.length).toBe('PLAYER-'.length + 36);
      expect(result).toMatch(new RegExp(`^PLAYER-[a-z0-9-]{8}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{12}$`));
    });

    it('should parse the UUID ', () => {
      const id = 'GAME_EVENT__GAME-0b1b1b03-260b-4ba2-8478-5befb579eed0__GAME_EVENT-162d2385-626b-4f39-8af0-374a3b10c864';

      const result = adapter.toRawId(id, EntityType.GAME);
      expect(result.length).toBe('GAME-'.length + 36);
      expect(result).toBe('GAME-0b1b1b03-260b-4ba2-8478-5befb579eed0');
    });
  });

  describe('replication', () => {
    let source;
    let target;

    beforeEach(() => {
      source = new PouchDB('source', { adapter: 'memory' });
      target = new PouchDB('target', { adapter: 'memory' });
    });

    afterEach(async () => {
      await source.destroy();
      await target.destroy();
    });

    it('should replicate to fresh database', async (done) => {
      await source.put({ _id: 'abc', name: 'Philippe', age: 30 });

      const sourceBefore = await source.allDocs();
      expect(sourceBefore.total_rows).toBe(1);

      const targetBefore = await target.allDocs();
      expect(targetBefore.total_rows).toBe(0);

      PouchDB.replicate(source, target);

      // wait for replication
      setTimeout(async () => {
        const sourceAfter = await source.allDocs({ include_docs: true });
        expect(sourceAfter.total_rows).toBe(1);

        const targetAfter = await target.allDocs({ include_docs: true });
        expect(targetAfter.total_rows).toBe(1);

        expect(sourceAfter.rows[0].doc).toEqual(targetAfter.rows[0].doc);

        done();
      }, 2000);
    });

    it('should replicate to database with new data', async (done) => {
      await source.put({ _id: 'abc', name: 'Philippe', age: 30 });
      await target.put({ _id: 'def', name: 'John', age: 40 });

      const sourceBefore = await source.allDocs();
      expect(sourceBefore.total_rows).toBe(1);

      const targetBefore = await target.allDocs();
      expect(targetBefore.total_rows).toBe(1);

      PouchDB.replicate(source, target);

      // wait for replication
      setTimeout(async () => {
        const sourceAfter = await source.allDocs({ include_docs: true });
        expect(sourceAfter.total_rows).toBe(1);

        const targetAfter = await target.allDocs({ include_docs: true });
        expect(targetAfter.total_rows).toBe(2);

        expect(sourceAfter.rows[0].doc).toEqual(targetAfter.rows[0].doc);

        done();
      }, 2000);
    });

    it('should replicate to database with updated data', async (done) => {
      await source.put({ _id: 'abc', name: 'Philipp', age: 29 });
      await target.put({ _id: 'abc', name: 'Philipp', age: 29 });

      const sourceBefore = await source.allDocs();
      expect(sourceBefore.total_rows).toBe(1);

      const targetBefore = await target.allDocs();
      expect(targetBefore.total_rows).toBe(1);

      // update the doc in source
      const doc = await source.get('abc');
      await source.put(Object.assign(doc, { name: 'Philippe', age: 30 }));

      // sync
      PouchDB.sync(source, target);

      // wait for replication
      setTimeout(async () => {
        const sourceAfter = await source.allDocs({ include_docs: true });
        expect(sourceAfter.total_rows).toBe(1);

        const targetAfter = await target.allDocs({ include_docs: true });
        expect(targetAfter.total_rows).toBe(1);

        expect(sourceAfter.rows[0].doc).toEqual({ _id: 'abc', name: 'Philippe', age: 30, _rev: jasmine.stringMatching(/^2-[0-9a-z]+$/) });
        expect(sourceAfter.rows[0].doc).toEqual(targetAfter.rows[0].doc);

        done();
      }, 2000);
    });

    it('should replicate to database with both updated data', async (done) => {
      await source.put({ _id: 'abc', name: 'Philipp', age: 29 });
      await target.put({ _id: 'abc', name: 'Philipp', age: 29 });

      const sourceBefore = await source.allDocs();
      expect(sourceBefore.total_rows).toBe(1);

      const targetBefore = await target.allDocs();
      expect(targetBefore.total_rows).toBe(1);

      // update the doc in source
      const docSource = await source.get('abc');
      await source.put(Object.assign(docSource, { name: 'Philippe', age: 30 }));

      // update the doc in target
      const docTarget = await target.get('abc');
      await target.put(Object.assign(docTarget, { name: 'Phillip', age: 28 }));

      const sourceRev = (await source.get('abc'))._rev;
      const targetRev = (await target.get('abc'))._rev;
      expect(sourceRev).toMatch(/^2-[0-9a-z]+$/);
      expect(targetRev).toMatch(/^2-[0-9a-z]+$/);
      // { name: 'Philippe', age: 30 } generates a higher _rev than { name: 'Phillip', age: 28 }!
      expect(sourceRev).toBeGreaterThan(targetRev);

      // sync
      PouchDB.sync(source, target);

      // wait for replication
      setTimeout(async () => {
        const sourceAfter = await source.allDocs({ include_docs: true });
        expect(sourceAfter.total_rows).toBe(1);

        const targetAfter = await target.allDocs({ include_docs: true });
        expect(targetAfter.total_rows).toBe(1);

        /**
         * As { name: 'Philippe', age: 30 } generates a higher _rev than { name: 'Phillip', age: 28 } does, so 'Philippe'/30 wins
         */
        expect(sourceAfter.rows[0].doc).toEqual({ _id: 'abc', name: 'Philippe', age: 30, _rev: jasmine.stringMatching(/^2-[0-9a-z]+$/) });
        expect(sourceAfter.rows[0].doc).toEqual(targetAfter.rows[0].doc);

        done();
      }, 2000);
    });

    it('should replicate to database with mixed data', async (done) => {
      await source.bulkDocs([
        { _id: 'abc', name: 'Philipp', age: 29 },
        { _id: 'def', name: 'John', age: 29 },
        { _id: 'ghi', name: 'Jane', age: 28 }
      ]);
      await target.bulkDocs([
        { _id: 'abc', name: 'Philipp', age: 29 },
        { _id: 'def', name: 'John', age: 29 },
        { _id: 'ghi', name: 'Jane', age: 28 }
      ]);

      const sourceBefore = await source.allDocs();
      expect(sourceBefore.total_rows).toBe(3);

      const targetBefore = await target.allDocs();
      expect(targetBefore.total_rows).toBe(3);

      // ------------------ change source ------------------
      // update
      const abcS = await source.get('abc');
      await source.put(Object.assign(abcS, { name: 'Philippe', age: 30 }));

      // remove
      const defS = await source.get('def');
      await source.remove(defS);

      // create
      await source.put({ _id: 'jkl', name: 'Hans', age: 42 });

      // ------------------ change target ------------------
      // update
      const abcT = await target.get('abc');
      await target.put(Object.assign(abcT, { name: 'Philippe', age: 31 }));

      // remove
      const ghiT = await target.get('ghi');
      await target.remove(ghiT);

      // create
      await target.put({ _id: 'mno', name: 'Max', age: 33 });

      const sourceRev = (await source.get('abc'))._rev;
      const targetRev = (await target.get('abc'))._rev;
      expect(sourceRev).toMatch(/^2-[0-9a-z]+$/);
      expect(targetRev).toMatch(/^2-[0-9a-z]+$/);
      // { name: 'Philippe', age: 30 } generates a higher _rev than { name: 'Philippe', age: 31 }!
      expect(sourceRev).toBeGreaterThan(targetRev);

      // sync
      PouchDB.sync(source, target);

      // wait for replication
      setTimeout(async () => {
        const sourceAfter = await source.allDocs({ include_docs: true });
        expect(sourceAfter.total_rows).toBe(3);

        const targetAfter = await target.allDocs({ include_docs: true });
        expect(targetAfter.total_rows).toBe(3);

        /**
         * As { name: 'Philippe', age: 30 } generates a higher _rev than { name: 'Philippe', age: 31 } does, so 'Philippe'/30 wins
         */
        expect(sourceAfter.rows[0].doc).toEqual({ _id: 'abc', name: 'Philippe', age: 30, _rev: jasmine.stringMatching(/^2-[0-9a-z]+$/) });
        expect(sourceAfter.rows[1].doc).toEqual({ _id: 'jkl', name: 'Hans', age: 42, _rev: jasmine.stringMatching(/^1-[0-9a-z]+$/) });
        expect(sourceAfter.rows[2].doc).toEqual({ _id: 'mno', name: 'Max', age: 33, _rev: jasmine.stringMatching(/^1-[0-9a-z]+$/) });
        expect(sourceAfter.rows).toEqual(targetAfter.rows);

        done();
      }, 2000);
    });
  });
});
