import {
  Body,
  Param,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  UseInterceptors,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
import * as crypto from "crypto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { AdminGuard } from "../admin/admin.guard";
import { AdminToken } from "../admin/admin.decorator";

@UseGuards(AdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(
    @AdminToken() admin_token: AdminTokenDto,
    @Param("id") id: crypto.UUID,
  ): Promise<UserDto> {
    return await this.userService.find(admin_token, id);
  }

  @Post()
  async createUser(
    @AdminToken() admin_token: AdminTokenDto,
    @Body() user: CreateUserDto,
  ): Promise<UserDto> {
    return await this.userService.create(admin_token, user);
  }

  @Put(":id")
  async updateUser(
    @AdminToken() admin_token: AdminTokenDto,
    @Param("id") id: crypto.UUID,
    @Body() user: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.userService.update(admin_token, id, user);
  }

  @Delete(":id")
  async deleteUser(
    @AdminToken() admin_token: AdminTokenDto,
    @Param("id") id: crypto.UUID,
  ): Promise<{ message: string }> {
    return await this.userService.delete(admin_token, id);
  }
}
