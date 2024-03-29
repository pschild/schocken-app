import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlCustom extends MatPaginatorIntl {
    itemsPerPageLabel = 'Elemente pro Seite';
    nextPageLabel = 'Nächste Seite';
    previousPageLabel = 'Vorherige Seite';
    firstPageLabel = 'Erste Seite';
    lastPageLabel = 'Letzte Seite';
    getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `0 von ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} von ${length}`;
    }
}
