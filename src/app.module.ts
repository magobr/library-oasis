import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./user/user.module";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { RbacModule } from "./rbac/rbac.module";
import { BooksModule } from "./books/books.module";
import { PatronModule } from "./patron/patron.module";

@Module({
  imports: [
    UsersModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RbacModule,
    BooksModule,
    PatronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
