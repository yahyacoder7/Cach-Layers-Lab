// src/supabase/supabase.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // reads .env
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as HttpErrors from '../common/http-errors';


interface UploadOptions {
  fieldname: string,
  originalname: string,
  encoding: string,
  mimetype: string,
  buffer: Buffer,
  size: number,
}


@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger("Supabase");
  private readonly client: SupabaseClient;
  private readonly config = new ConfigService();

  constructor() {
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

 async uploadImage(uploadOptions: UploadOptions){
    const {fieldname , originalname , encoding , mimetype , buffer , size} = uploadOptions;
     
 }


  

  async onModuleInit() {
    try {
      const { data, error } = await this.client.storage.listBuckets();

      this.logger.log("Connection successing to supabase")
    } catch (e) {
      this.logger.error('Error connecting to supabase', e); 
    }
  }
}
