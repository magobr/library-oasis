import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/database/database.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [DataBaseModule],
  controllers: [AdminController],
  providers: [AdminService, DataBaseModule],
})
export class AdminModule {}