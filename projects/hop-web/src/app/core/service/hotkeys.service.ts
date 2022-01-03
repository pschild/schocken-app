import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

type Options = {
  element: any;
  description: string | undefined;
  keys: string;
};

@Injectable({
  providedIn: 'root'
})
export class HotkeysService {

  hotkeys = new Map();

  defaults: Partial<Options> = {
    element: this.document
  };

  constructor(
    private eventManager: EventManager,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  addShortcut(options: Partial<Options>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;

    if (!!merged.description) {
      this.hotkeys.set(merged.keys, merged.description);
    }

    return new Observable(observer => {
      const handler = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          return;
        }
        e.preventDefault();
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(merged.element, event, handler);

      return () => {
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    });
  }
}
