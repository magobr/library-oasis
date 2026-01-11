import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private databaseService: DataBaseService){}

  async getHello() {
    try {
      return await this.databaseService.user.findUnique({
        where: {
          id: "ae968487-ff2b-4649-be2e-f58b0860df0c",
        },
      });
    } catch(e) {
      return e
    }
    
  }
}
