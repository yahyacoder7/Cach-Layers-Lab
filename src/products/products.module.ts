import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
@Module({
  controllers: [ProductsController],
  providers: [ProductsService , PrismaService , SupabaseService],
})
export class ProductsModule {}
