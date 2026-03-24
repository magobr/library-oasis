import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UUID } from "crypto";
import { InsertRoleRbacDto } from "./dto/insert_role-rbac.dto";
import { DataBaseService } from "../database/database.service";
import { JwtService } from "@nestjs/jwt";
import { VerifyRoleRbacDto } from "./dto/verify_roles-rbac.dto";
import { ResponseRoleTypeRbacDto } from "./dto/response_roletype-rbac.dto";
import { ResponseRoleRbacDto } from "./dto/response_role-rbac.dto";
import { ResponseUpdateRoleRbacDto } from "./dto/response_update_role-rbac.dto";
import { UpdateRoleRbacDto } from "./dto/update_role-rbac.dto";
import { JwtPayload } from "./dto/jwt.dto";

@Injectable()
export class RbacService {
  constructor(
    private readonly databaseService: DataBaseService,
    private jwtService: JwtService,
  ) {}

  async insertRole(
    role_types: InsertRoleRbacDto,
    admin: string,
  ): Promise<ResponseRoleRbacDto> {
    try {
      const admin_payload = this.verifyTokenSync(admin) as {
        id: UUID;
        email: string;
        name: string;
        iat: number;
        exp: number;
      };

      const roles_exist = await this.verifyRoles(admin_payload.id);

      if (roles_exist) {
        throw new HttpException(
          "Admin already has a role",
          HttpStatus.BAD_REQUEST,
        );
      }

      const insert_role_type = await this.databaseService.roleTypes.create({
        data: {
          type: role_types.role_type,
          create: role_types.roles.create,
          read: role_types.roles.read,
          update: role_types.roles.update,
          delete: role_types.roles.delete,
        },
      });

      const insert_roles = await this.databaseService.roles.create({
        data: {
          admin_id: admin_payload.id,
          type_id: insert_role_type.id,
        },
      });

      return {
        message: "Role type and roles inserted successfully",
        role_type: insert_role_type.id,
        roles: insert_roles.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async insertInnitialRoles(admin: string): Promise<ResponseRoleRbacDto> {
    try {
      const role_user = await this.databaseService.roleTypes.findFirst({
        where: {
          type: "USER",
        },
      });

      if (!role_user) {
        throw new HttpException("Role User NotFount", HttpStatus.NOT_FOUND);
      }

      const insert_roles = await this.databaseService.roles.create({
        data: {
          admin_id: admin,
          type_id: role_user.id,
        },
      });

      return {
        message: "Role type and roles inserted successfully",
        role_type: role_user.id,
        roles: insert_roles.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRoles(admin: string): Promise<ResponseRoleTypeRbacDto> {
    try {
      const admin_payload = this.verifyTokenSync(admin) as {
        id: UUID;
        email: string;
        name: string;
        iat: number;
        exp: number;
      };

      const roles_admin = await this.databaseService.roleTypes.findFirst({
        select: {
          id: true,
          type: true,
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        where: {
          roles: {
            some: {
              admin: {
                id: admin_payload.id,
              },
            },
          },
        },
      });

      if (!roles_admin) {
        throw new HttpException(
          "No roles found for this admin",
          HttpStatus.NOT_FOUND,
        );
      }

      return roles_admin;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRoeles(
    roles: UpdateRoleRbacDto,
    admin: string,
  ): Promise<ResponseUpdateRoleRbacDto> {
    try {
      const admin_payload = this.verifyTokenSync(admin) as {
        id: UUID;
        email: string;
        name: string;
        iat: number;
        exp: number;
      };

      const roles_admin = await this.verifyRoles(admin_payload.id);

      if (!roles_admin) {
        throw new HttpException(
          "No roles found for this admin",
          HttpStatus.NOT_FOUND,
        );
      }

      const new_roles_admin = await this.databaseService.roles.update({
        data: {
          roleType: {
            update: {
              type: roles.role_type,
              create: roles.roles.create,
              read: roles.roles.read,
              update: roles.roles.update,
              delete: roles.roles.delete,
            },
          },
        },
        where: {
          id: roles_admin.id,
        },
      });

      return {
        message: "Role type and roles inserted successfully",
        roles: new_roles_admin.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRoles(admin: UUID): Promise<{ message: string }> {
    try {
      const roles_admin = await this.verifyRoles(admin);

      if (!roles_admin) {
        throw new HttpException(
          "No roles found for this admin",
          HttpStatus.NOT_FOUND,
        );
      }

      await this.databaseService.roles.delete({
        where: {
          id: roles_admin.id,
        },
      });

      await this.databaseService.roleTypes.delete({
        where: {
          id: roles_admin.type_id,
        },
      });

      return { message: "Roles deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyRoles(admin: UUID): Promise<VerifyRoleRbacDto | null> {
    const roles_admin = await this.databaseService.roles.findFirst({
      where: {
        admin: {
          id: admin,
        },
      },
    });

    return roles_admin;
  }

  async getRole(role_id: UUID): Promise<ResponseRoleTypeRbacDto | null> {
    const role = await this.databaseService.roleTypes.findUnique({
      where: {
        id: role_id,
      },
    });
    return role;
  }

  async isReadRole(role_id: UUID): Promise<boolean> {
    const role = await this.getRole(role_id);
    return role?.read ?? false;
  }

  async isUpdateRole(role_id: UUID): Promise<boolean> {
    const role = await this.getRole(role_id);
    return role?.update ?? false;
  }

  async isDeleteRole(role_id: UUID): Promise<boolean> {
    const role = await this.getRole(role_id);
    return role?.delete ?? false;
  }

  async isCreateRole(role_id: UUID): Promise<boolean> {
    const role = await this.getRole(role_id);
    return role?.create ?? false;
  }

  verifyTokenSync(token: string) {
    const payload: JwtPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    return payload;
  }
}
