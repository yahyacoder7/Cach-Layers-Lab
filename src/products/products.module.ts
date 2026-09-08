import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
@Module({
  controllers: [ProductsController],
  providers: [ProductsService , PrismaService , ConfigService],
})
export class ProductsModule {}
