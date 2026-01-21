
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InsertRoleRbacDto } from './dto/insert_role-rbac.dto';
import { DataBaseService } from '../database/database.service';
import { UUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RbacService {
    constructor(
        private readonly databaseService: DataBaseService,
        private jwtService: JwtService  
    ) {}

    async insetRole(role_types: InsertRoleRbacDto, admin: string) {
        try {

            console.log(role_types)

            const admin_payload = this.verifyTokenSync(admin) as {id: UUID, email: string, name: string, iat: number, exp: number};

            const insert_role_type = await this.databaseService.roleTypes.create({
                data: {
                    type: role_types.role_type,
                    create: role_types.roles.create,
                    read: role_types.roles.read,
                    update: role_types.roles.update,
                    delete: role_types.roles.delete
                }
            });

            const insert_roles = await this.databaseService.roles.create({
                data: {
                    admin_id: admin_payload.id,
                    type_id: insert_role_type.id
                }
            });

            return {
                message: 'Role type and roles inserted successfully',
                role_type: insert_role_type,
                roles: insert_roles
            }

        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    verifyTokenSync(token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            return payload;
        } catch (error) {
            throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
        }
    }

}

