import { Module } from "@nestjs/common";
import { PatronController } from "./patron.controller";
import { PatronService } from "./patron.service";
import { DataBaseModule } from "src/database/database.module";
import { AdminGuard } from "src/admin/admin.guard";
import { RbacService } from "src/rbac/rbac.service";
import { BooksService } from "src/books/books.service";

@Module({
  imports: [DataBaseModule],
  controllers: [PatronController],
  providers: [
    PatronService,
    DataBaseModule,
    AdminGuard,
    RbacService,
    BooksService,
  ],
})
export class PatronModule {}
