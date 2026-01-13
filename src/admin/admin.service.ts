import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataBaseService } from '../database/database.service';
import { AdminDto } from './dto/admin.dto';
import { UUID } from 'crypto';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DataBaseService) {}

  async find(id: UUID): Promise<AdminDto> {
    try {
      const admin = await this.databaseService.systemAdmin.findFirst({
        where: { id: id },
      });

      if (!admin) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
      };
    } catch (e) {
      return e;
    }
  }
}
