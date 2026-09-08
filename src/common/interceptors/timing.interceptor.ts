import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { ne } from 'zod/v4/locales';
import { json } from 'zod';

@Injectable()
// @Injectable() lets NestJS manage this class and inject it where used
export class TimingInterceptor implements NestInterceptor {
    // NestInterceptor = contract: we must provide an intercept() method

    private logger = new Logger('Statistic');
    // logger labeled "Statistic" so its output is easy to find/group in the console

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
       // context = everything about the current request (method, url, headers...)
       // next    = the "rest of the pipeline" (controller handler), which we can wrap

       const now = Date.now();
       // now = timestamp just BEFORE the handler runs

       const req:Request = context.switchToHttp().getRequest();
       // switchToHttp() reaches into the HTTP-specific data; getRequest() returns the Express request

       const {method , url } = req;
       // pull out the HTTP verb (GET/POST...) and the URL, for the log line

       return next.handle().pipe(
        // run the actual handler... but attach extra steps while the response flows back

        tap((data)=>{
        // tap() lets us observe the response "data" WITHOUT modifying it (side-effect only)

            const time = Date.now()- now;
            // elapsed ms = current time minus the "now" we captured before handling

            const sizeOfData = JSON.stringify(data).length;
            // size of the response payload in bytes (JSON length) — handy for cache-weight decisions

            this.logger.debug(`${method} ${url} ${time}ms ${sizeOfData} bytes`)
            // one clean log line per request, e.g. "GET /products 3ms 250 bytes"
        })
       )
    }
}