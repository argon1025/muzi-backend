import { BadRequestException, ClassSerializerInterceptor, MiddlewareConsumer, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campain.module';
import { ParsingEventModule } from './library/parsing-event/parsing-event.module';
import { HttpLoggerMiddleware } from './library/middleware/http-logger/http-logger.middleware';
import { CustomLoggerModule } from './library/custom-logger/custom-logger.module';
import { HealthModule } from './health/health.module';
import { ERROR_CODE } from './library/exception/error.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `environments/.env.${process.env.NODE_ENV || 'prod'}`,
    }),
    UserModule,
    AuthModule,
    CampaignModule,
    ScheduleModule.forRoot(),
    ParsingEventModule,
    CustomLoggerModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true, // transform payload to DTO
        forbidUnknownValues: true, // throw error if unknown properties are present
        exceptionFactory: (errors: ValidationError[]) => {
          if (!errors[0]?.constraints) return new BadRequestException(ERROR_CODE.INVALID_DATA);
          const firstKey = Object.keys(errors[0].constraints)[0];
          throw new BadRequestException({ ...ERROR_CODE.INVALID_DATA, message: errors[0].constraints[firstKey] });
        },
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
