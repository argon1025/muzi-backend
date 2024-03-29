import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpLogger } from './library/custom-logger/http-logger/http.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get<ConfigService>(ConfigService);

  const servicePort = configService.getOrThrow<number>('SERVICE_PORT');

  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ALLOW_ORIGIN.split(','),
  });

  const config = new DocumentBuilder()
    .setTitle('Muzi API')
    .setDescription('무지 백엔드 서비스')
    .setVersion('1.0')
    .addTag('- 회원')
    .addTag('- 회원 가입')
    .addTag('- 캠페인')
    .addTag('- ALB Health Check')
    .addCookieAuth('refreshToken', { type: 'apiKey', description: '리프레시 토큰' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { customSiteTitle: 'Muzi API' });

  app.use(cookieParser());
  app.useLogger(app.get(HttpLogger));

  await app.listen(servicePort);
}
bootstrap();
