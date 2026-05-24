import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const userId = user?.userId ?? user?.id ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          this.logger.log(`${method} ${url} ${res.statusCode} ${duration}ms [user:${userId}]`);
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.logger.error(
            `${method} ${url} ${err.status ?? 500} ${duration}ms [user:${userId}] - ${err.message}`,
          );
        },
      }),
    );
  }
}
