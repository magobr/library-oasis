import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DataBaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL as string;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // Pass the adapter to the super constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}