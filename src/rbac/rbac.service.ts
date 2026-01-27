
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UUID } from 'crypto';
import { InsertRoleRbacDto, RoleName } from './dto/insert_role-rbac.dto';
import { DataBaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { VerifyRoleRbacDto } from './dto/verify_roles-rbac.dto';
import { ResponseRoleTypeRbacDto } from './dto/response_roletype-rbac.dto';
import { ResponseRoleRbacDto } from './dto/response_role-rbac.dto';
import { ResponseUpdateRoleRbacDto } from './dto/response_update_role-rbac.dto';
import { UpdateRoleRbacDto } from './dto/update_role-rbac.dto';

@Injectable()
export class RbacService {
    constructor(
        private readonly databaseService: DataBaseService,
        private jwtService: JwtService  
    ) {}

    async insertRole(role_types: InsertRoleRbacDto, admin: string): Promise<ResponseRoleRbacDto> {
        try {

            const admin_payload = this.verifyTokenSync(admin) as {id: UUID, email: string, name: string, iat: number, exp: number};

            const roles_exist = await this.verifyRoles(admin_payload.id);

            if (roles_exist) {
                throw new HttpException('Admin already has a role', HttpStatus.BAD_REQUEST);
            }

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
                role_type: insert_role_type.id,
                roles: insert_roles.id
            }

        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async insertInnitialRoles(admin: string): Promise<ResponseRoleRbacDto> {
        try {
            const role: InsertRoleRbacDto = {
                role_type: RoleName.ADMIN,
                roles: { create: false, read: true, update: false, delete: false }
            };

            const insert_role_type = await this.databaseService.roleTypes.create({
                data: {
                    type: role.role_type,
                    create: role.roles.create,
                    read: role.roles.read,
                    update: role.roles.update,
                    delete: role.roles.delete
                }
            });

            const insert_roles = await this.databaseService.roles.create({
                data: {
                    admin_id: admin,
                    type_id: insert_role_type.id
                }
            });

            return {
                message: 'Role type and roles inserted successfully',
                role_type: insert_role_type.id,
                roles: insert_roles.id
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async getUserRoles(admin: string): Promise<ResponseRoleTypeRbacDto> {
        try {
            
            const admin_payload = this.verifyTokenSync(admin) as {id: UUID, email: string, name: string, iat: number, exp: number};

            const roles_admin = await this.databaseService.roleTypes.findFirst({
                select: {
                    id: true,
                    type: true,
                    create: true,
                    read: true,
                    update: true,
                    delete: true
                },
                where: {
                    roles: {
                        some: {
                            admin: {
                                id: admin_payload.id
                            }
                        }
                    }
                }
            });

            if (!roles_admin) {
                throw new HttpException('No roles found for this admin', HttpStatus.NOT_FOUND);
            }

            return roles_admin;

        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async updateRoeles(roles: UpdateRoleRbacDto, admin: string): Promise<ResponseUpdateRoleRbacDto> {
        try {
            const admin_payload = this.verifyTokenSync(admin) as {id: UUID, email: string, name: string, iat: number, exp: number};

            const roles_admin = await this.verifyRoles(admin_payload.id);

            if (!roles_admin) {
                throw new HttpException('No roles found for this admin', HttpStatus.NOT_FOUND);
            }

            const new_roles_admin = await this.databaseService.roles.update({
                data: {
                    roleType: {
                        update: {
                            type: roles.role_type,
                            create: roles.roles.create,
                            read: roles.roles.read,
                            update: roles.roles.update,
                            delete: roles.roles.delete
                        }
                    }
                },
                where: {
                    id: roles_admin.id,
                }
            });

            return {
                message: 'Role type and roles inserted successfully',
                roles: new_roles_admin.id
            }
            
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async deleteRoles(admin: UUID): Promise<{ message: string }> {
        try {
            const roles_admin = await this.verifyRoles(admin);

            if (!roles_admin) {
                throw new HttpException('No roles found for this admin', HttpStatus.NOT_FOUND);
            }

            await this.databaseService.roles.delete({
                where: {
                    id: roles_admin.id
                }
            });

            await this.databaseService.roleTypes.delete({
                where: {
                    id: roles_admin.type_id
                }
            });

            return { message: 'Roles deleted successfully' };

        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async verifyRoles(admin: UUID): Promise<VerifyRoleRbacDto | null> {
        const roles_admin = await this.databaseService.roles.findFirst({
            where: {
                admin: {
                    id: admin
                }
            }
        });

        return roles_admin;
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

