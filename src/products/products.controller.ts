import { Controller, Get, Post, Body, Patch, Param, Delete , Query} from '@nestjs/common';
import { ProductsService } from './products.service';
import { createProductSchema } from './dto/create-product.dto';
import { updateProductSchema } from './dto/update-product.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { productQuerySchema } from './dto/query-products.dto';
import type { ProductQueryDto } from  './dto/query-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Post()
  create(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }
  @Get("paginated")
  paginatedFindAll(
    @Query(new ZodValidationPipe(productQuerySchema))
    query: ProductQueryDto,
  ) {
    return this.productsService.paginatedFindAll(query);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

}