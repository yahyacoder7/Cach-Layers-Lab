import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { SupabaseModule } from './supabase/supabase.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
     PrismaModule,
      ProductsModule, 
      RedisModule, SupabaseModule ,  
    EventEmitterModule.forRoot()
    ],
  controllers: [AppController],
  providers: [
    AppService,
    // WHY register the interceptor here with APP_INTERCEPTOR instead of in main.ts:
    // - APP_INTERCEPTOR registers it GLOBALLY through NestJS dependency injection,
    //   so it can inject other providers (ConfigService, PrismaService, etc.).
    // - main.ts app.useGlobalInterceptors(...) runs OUTSIDE the DI container:
    //   it cannot inject dependencies, so the interceptor could NOT be a class
    //   that needs constructor injection.
    // - Bonus: it is created once with the app context and is testable via TestingModule.
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
    ],
})
export class AppModule { }
