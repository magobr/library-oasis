import { Body, Param, ClassSerializerInterceptor, Controller, Get, Post, Put, UseInterceptors, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../admin/admin.guard';

@UseGuards(AdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {  
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param('id') id: crypto.UUID): Promise<UserDto> {
    return await this.userService.find(id);
  }

  @Post()
  async createUser(@Body() user: CreateUserDto): Promise<UserDto> {
    return await this.userService.create(user);
  }

  @Put(":id")
  async updateUser(
    @Param('id') id: crypto.UUID,
    @Body() user: UpdateUserDto
  ): Promise<UserDto> {
    return await this.userService.update(id, user);
  }

  @Delete(":id")
  async deleteUser(
    @Param('id') id: crypto.UUID
  ): Promise<{message: string}> {
    return await this.userService.delete(id);
  }
}
