import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductQueryDto } from './dto/query-products.dto';
import * as HttpErrors from '../common/http-errors';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createProductDto: CreateProductDto, image?: Express.Multer.File) {
    // ① stop early if the unique SKU is already taken — before any upload
    const exists = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (exists) {
      throw new HttpErrors.ConflictException(
        `SKU ${createProductDto.sku} already exists`,
      );
    }

    const slug = await this.generateUniqueSlug(createProductDto.name);

    const imageUrl = await this.resolveImage(image);

    try {
      return await this.prisma.product.create({
        data: { ...createProductDto, slug, imageUrl },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new HttpErrors.ConflictException(
          `SKU ${createProductDto.sku} already exists`,
        );
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!product) {
      throw new HttpErrors.NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto , file?: Express.Multer.File) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new HttpErrors.NotFoundException(`Product #${id} not found`);
    }

    // Generate new slug if name changed
    let newSlug = existing.slug;
    if (updateProductDto.name && updateProductDto.name !== existing.name) {
      newSlug = await this.generateUniqueSlug(updateProductDto.name);
    }

    // Same image logic as create: only upload/delete if a new file came in
    const imageUrl = await this.resolveImage(file, existing.imageUrl);

    return this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto, slug: newSlug, imageUrl },
    });
  }

  private async resolveImage(
    file?: Express.Multer.File,
    existingUrl?: string | null,
  ): Promise<string | null> {
    // No new file → keep whatever was already stored (null on create, old URL on update)
    if (!file) return existingUrl ?? null;

    // New file arrived → if an old image exists, delete it from the bucket first
    if (existingUrl) {
      const oldKey = this.supabaseService.extractKeyFromUrl(existingUrl);
      if (oldKey) {
        try {
          await this.supabaseService.deleteImage(oldKey);
        } catch (e) {
          console.warn(`Failed to delete old image: ${(e as Error).message}`);
        }
      }
    }

    // Upload the new one and return its public URL
    const filePath = await this.supabaseService.uploadImage(file);
    return this.supabaseService.getImageUrl(filePath);
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new HttpErrors.NotFoundException(`Product #${id} not found`);
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
    const res = await this.prisma.product.findMany({
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: query.limit,
      orderBy: { id: 'asc' },
    });
    if (res.length === 0) {
      return [];
    }
    return res;
  }
}
