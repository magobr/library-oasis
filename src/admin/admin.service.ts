import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UUID } from 'crypto';
import { RbacService } from '../rbac/rbac.service';
import { DataBaseService } from '../database/database.service';
import { AdminDto } from './dto/admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthAdminDto } from './dto/auth-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly rbacService: RbacService,
    private jwtService: JwtService
  ) {}

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

  async create(admin: CreateAdminDto): Promise<AdminDto> {
    try {
      const hash_password = await this.hashPassword(admin.password);
      const new_admin = await this.databaseService.systemAdmin.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hash_password,
        },
      });

      const roles = await this.rbacService.insertInnitialRoles(new_admin.id);

      if (!roles) {
        throw new HttpException('Error assigning roles to admin', HttpStatus.BAD_REQUEST);
      }

      return {
        id: new_admin.id,
        email: new_admin.email,
        name: new_admin.name,
        createdAt: new_admin.createdAt,
      };
    } catch (e) {

      if (e.code === 'P2002') {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
      
      return e;
    }
  }
  
  async update(id: UUID, admin: UpdateAdminDto): Promise<AdminDto> {
    try {
      let hash_password: string;

      if (admin.password) {
        hash_password = await this.hashPassword(admin.password);

        await this.databaseService.systemAdmin.update({
          where: { id: id },
          data: {
            password: hash_password,
          },
        });
      }

      const updated_admin = await this.databaseService.systemAdmin.update({
        where: { id: id },
        data: {
          email: admin.email,
          name: admin.name
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      return updated_admin;
    } catch (e) {

      if(e.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if(e.code === 'P2002') {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }

      return e;
    }
  }

  async delete(id: UUID) {
    try {
      await this.rbacService.deleteRoles(id);

      await this.databaseService.systemAdmin.delete({
        where: { id: id },
      });

      return { message: 'Admin deleted successfully' };
    } catch (e) {
      if(e.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return e;
    }
  }

  async authenticate({ email, password }: { email: string; password: string }): Promise<AuthAdminDto> {
    try {
      const admin = await this.databaseService.systemAdmin.findFirst({
        where: { email: email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          roles: {
            select: {
              id: true,
              roleType: {
                select: {
                  id: true,
                }
              }
            }
          }
        },
      });

      if (!admin) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await this.comparePassword(password, admin.password);

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.roles[0].id,
        roleType: admin.roles[0].roleType.id
      };

      const access_token = await this.jwtService.signAsync(payload);

      return {access_token};
    } catch (e) {
      return e;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const match = await bcrypt.compare(password, hash);
    return match;
  }
}
