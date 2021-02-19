import { NativeDateAdapter } from '@angular/material/core';
import { parse } from 'date-fns';

export class MatDateAdapterCustom extends NativeDateAdapter {
    parse(value: string | number): Date | null {
        return parse(value.toString(), 'dd.MM.yyyy', new Date());
    }
}
