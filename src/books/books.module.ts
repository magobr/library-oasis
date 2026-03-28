import { Module } from "@nestjs/common";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import { AdminGuard } from "../admin/admin.guard";
import { DataBaseModule } from "../database/database.module";
import { RbacService } from "../rbac/rbac.service";

@Module({
  imports: [DataBaseModule],
  controllers: [BooksController],
  providers: [BooksService, DataBaseModule, RbacService, AdminGuard],
})
export class BooksModule {}
