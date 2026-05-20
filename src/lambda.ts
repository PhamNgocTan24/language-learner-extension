import { Handler, Context } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessHttp = require('serverless-http');

// Reuse the handler across warm invocations — do NOT re-bootstrap on every call
let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, {
    // Suppress NestJS startup banner in Lambda logs
    logger: ['error', 'warn', 'log'],
  });

  // Match CORS config from your local main.ts if applicable
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessHttp(expressApp, {
    basePath: process.env.API_BASE_PATH || '/prod',
  });
}

export const handler = async (event: any, context: Context, callback: any) => {
  // Reuse existing instance on warm starts
  server = server ?? (await bootstrap());

  // EventBridge warm-up ping — respond immediately without hitting the app
  if (event?.source === 'aws.events' && event?.['detail-type'] === 'Scheduled Event') {
    console.log('Warm-up ping received from EventBridge');
    return { statusCode: 200, body: 'warm' };
  }

  return server(event, context, callback);
};
