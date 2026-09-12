// src/supabase/supabase.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // reads .env
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as HttpErrors from '../common/http-errors';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger('Supabase');
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `product/${fileName}`;
    const fileBuffer = file.buffer;
    const fileType = file.mimetype;

    const { data, error } = await this.client.storage
      .from('Cach-Lab-Images')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: false,
      });


      if (error){
        throw new HttpErrors.InternalServerErrorException(`Supabase Upload Error: ${error.message}`);
      }
      return filePath;
  }

  async getImageUrl(filePath: string): Promise<string> {
    const { data: { publicUrl } } = this.client.storage.from('Cach-Lab-Images').getPublicUrl(filePath);
    return publicUrl;
  }

  async onModuleInit() {
   
      const { data, error } = await this.client.storage.listBuckets();

      this.logger.log('Connection successing to supabase');
  if(error) this.logger.error('Error connecting to supabase', error);
  
  }
}
