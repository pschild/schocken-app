import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handler'
})
export class HandlerPipe implements PipeTransform {

  transform(value: any, handler: (value: any) => any, context?: any): any {
    if (context) {
      return handler.call(context, value);
    }
    return handler(value);
  }

}
