import { Server } from 'http';
import { Context, Handler } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  const expressApp = require('express')();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: true,
  });

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin',
    );
    next();
  });
  await app.init();
  return createServer(expressApp);
}
export const handler: Handler = async (
  event: any,
  context: Context,
): Promise<Response> => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  console.log(JSON.stringify(event, null, 2));

  // if (typeof event.body === 'string') {
  //   try {
  //     event.body = JSON.parse(event.body);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
