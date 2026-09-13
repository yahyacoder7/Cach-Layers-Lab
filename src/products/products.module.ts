import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RedisService } from '../redis/redis.service';
@Module({
  controllers: [ProductsController],
  providers: [ProductsService , PrismaService , SupabaseService, RedisService],
})
export class ProductsModule {}
