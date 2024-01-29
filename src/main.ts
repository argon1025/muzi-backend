import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const servicePort = configService.getOrThrow<number>('SERVICE_PORT');

  const config = new DocumentBuilder()
    .setTitle('Muzi API')
    .setDescription('무지 백엔드 서비스')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { customSiteTitle: 'Muzi API' });

  await app.listen(servicePort);
}
bootstrap();
