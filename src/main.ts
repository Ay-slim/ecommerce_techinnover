import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:6969'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: false,
  });
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The ecommerce app API definitions')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(6969);
  const appUrl = await app.getUrl()
  console.log(`Application is running on: ${appUrl}`);
}
bootstrap();
