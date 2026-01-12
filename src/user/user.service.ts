import { HttpException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { DataBaseService } from '../database/database.service';
import { UserDto } from './dto/user.dto';

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
        throw new HttpException('User not found', 404);
      } 
      
      return search_user;
      
    } catch(e) {
      return e
    } 
  }
}
