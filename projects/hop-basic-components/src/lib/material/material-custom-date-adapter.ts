import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { parse } from 'date-fns';

@Injectable()
export class MatDateAdapterCustom extends NativeDateAdapter {
    parse(value: string | number): Date | null {
        return parse(value.toString(), 'dd.MM.yyyy', new Date());
    }
}
