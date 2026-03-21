import {
  Param,
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import * as crypto from "crypto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";

// @UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(":id")
  getAdmin(@Param("id") id: crypto.UUID) {
    return this.adminService.find(id);
  }

  @Post()
  async createAdmin(@Body() new_admin: CreateAdminDto) {
    return await this.adminService.create(new_admin);
  }

  @Put(":id")
  async updateAdmin(
    @Param("id") id: crypto.UUID,
    @Body() updated_admin: UpdateAdminDto,
  ) {
    return await this.adminService.update(id, updated_admin);
  }

  @Delete(":id")
  async deleteAdmin(@Param("id") id: crypto.UUID) {
    return await this.adminService.delete(id);
  }

  @Post("auth")
  async authAdmin(@Body() auth_admin: { email: string; password: string }) {
    return await this.adminService.authenticate(auth_admin);
  }
}
