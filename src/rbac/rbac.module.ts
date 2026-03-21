import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { DataBaseModule } from "src/database/database.module";
import { RbacService } from "./rbac.service";

@Module({
  imports: [
    DataBaseModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  exports: [RbacService],
  providers: [RbacService, DataBaseModule],
})
export class RbacModule {}
