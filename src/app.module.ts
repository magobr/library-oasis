import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [UsersModule,  ConfigModule.forRoot({
    isGlobal: true,
  }), AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
