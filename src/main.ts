import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

export function setNestApp<T extends INestApplication>(app: T): T {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // const config = new DocumentBuilder()
  //   .setTitle('Nestjs Serverless')
  //   .setDescription('The Nestjs Serverless API description')
  //   .setVersion('1.0')
  //   .addTag('nestjs-serverless')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  return app;
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  return setNestApp(app);
}

async function run() {
  const nestApp = await bootstrap();

  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin',
  });

  await nestApp.listen(process.env.PORT || 3000);
}

run();
