import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from 'src/database/database.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { RbacService } from '../rbac/rbac.service';

@Module({
  imports: [
    DataBaseModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [AdminGuard],
  controllers: [AdminController],
  providers: [AdminService, DataBaseModule, AdminGuard, RbacService],
})
export class AdminModule {}