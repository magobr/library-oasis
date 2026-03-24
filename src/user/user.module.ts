import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DataBaseModule } from "src/database/database.module";
import { RbacModule } from "src/rbac/rbac.module";

@Module({
  imports: [DataBaseModule, RbacModule],
  controllers: [UserController],
  providers: [UserService, DataBaseModule, RbacModule],
})
export class UsersModule {}
