import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    UsersModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
