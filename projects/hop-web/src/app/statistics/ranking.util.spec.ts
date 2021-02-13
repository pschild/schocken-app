import { RankingUtil } from './ranking.util';

describe('RankingUtil', () => {

  const collection = [
    { playerId: '1', pointsSum: 300, pointsQuote: 0.49 },
    { playerId: '2', pointsSum: 300, pointsQuote: 0.5 },
    { playerId: '3', pointsSum: 301, pointsQuote: 0.4 },
    { playerId: '4', pointsSum: 299, pointsQuote: 0.4 },
    { playerId: '5', pointsSum: 300, pointsQuote: 0.5 },
    { playerId: '6', pointsSum: 299, pointsQuote: 0.6 },
    { playerId: '7', pointsSum: 250, pointsQuote: 0.5 },
    { playerId: '8', pointsSum: 280, pointsQuote: 0.5 }
  ];

  it('should sort', () => {
    expect(RankingUtil.sort(collection, ['pointsSum', 'pointsQuote'])).toEqual([
      { rank: 1, items: [
        { playerId: '3', pointsSum: 301, pointsQuote: 0.4 }
      ] },
      { rank: 2, items: [
        // tslint:disable-next-line:max-line-length
        { playerId: '2', pointsSum: 300, pointsQuote: 0.5 }, { playerId: '5', pointsSum: 300, pointsQuote: 0.5 }
      ] },
      { rank: 3, items: [
        { playerId: '1', pointsSum: 300, pointsQuote: 0.49 }
      ] },
      { rank: 4, items: [
        { playerId: '6', pointsSum: 299, pointsQuote: 0.6 }
      ] },
      { rank: 5, items: [
        { playerId: '4', pointsSum: 299, pointsQuote: 0.4 }
      ] },
      { rank: 6, items: [
        { playerId: '8', pointsSum: 280, pointsQuote: 0.5 }
      ] },
      { rank: 7, items: [
        { playerId: '7', pointsSum: 250, pointsQuote: 0.5 }
      ] }
    ]);
  });
});
