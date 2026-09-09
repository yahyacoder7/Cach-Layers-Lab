import { Injectable, NotFoundException, HttpException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'generated/prisma/browser';
import { ProductQueryDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(createProductDto.name);

    const data = {
      ...createProductDto,
      slug,
    };

    return this.prisma.product.create({ data });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;
    let i = 2;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (!existing) return slug;
      slug = `${base}-${i}`;
      i++;
    }
  }

  async paginatedFindAll(query: ProductQueryDto) {
    const res =  await this.prisma.product.findMany({
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: query.limit,
      orderBy: { id: 'asc' },
    });
    if(res.length === 0){
      throw new BadRequestException("No more products found")
    }


    return res;
  }
}
