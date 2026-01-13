import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { DataBaseService } from '../database/database.service';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DataBaseService){}

  async find(id: UUID): Promise<UserDto> {
    try {
      const search_user = await this.databaseService.user.findUnique({
        where: {
          id: id,
        },
      });

      if (typeof search_user !== 'object' || search_user === null) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      } 
      
      return search_user;
      
    } catch(e) {
      if (e.status === HttpStatus.NOT_FOUND) {
        return e;
      }

      throw new HttpException('Error find user', HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async create(user: CreateUserDto): Promise<UserDto> {
    try {
      const new_user = await this.databaseService.user.create({
        data: {
          ...user,
        },
      });
      return new_user;
    } catch (e) {

      if(e.code === 'P2002') {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }

      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: UUID, user: UpdateUserDto): Promise<UserDto> {
    try {
      const updated_user = await this.databaseService.user.update({
        where: {
          id: id,
        },
        data: {
          ...user,
        },
      });
      return updated_user;
    } catch (e) {

      if(e.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: UUID): Promise<{message: string}> {
    try {
      const result = await this.databaseService.user.delete({
        where: { id: id },
      })
      
      return {
        message: 'User deleted successfully'
      }
    } catch (e) {
      if(e.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
