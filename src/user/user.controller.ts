import { Param, ClassSerializerInterceptor, Controller, Get, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import * as crypto from 'crypto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {  
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param('id') id: crypto.UUID): Promise<UserDto> {
    return await this.userService.find(id);
  }
}
