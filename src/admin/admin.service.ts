import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { UUID } from "crypto";
import { RbacService } from "../rbac/rbac.service";
import { DataBaseService } from "../database/database.service";
import { AdminDto, AdminTokenDto } from "./dto/admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AuthAdminDto } from "./dto/auth-admin.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly rbacService: RbacService,
    private jwtService: JwtService,
  ) {}

  async find(admin_token: AdminTokenDto, id: UUID): Promise<AdminDto> {
    try {
      if (!admin_token) {
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
      }

      const role_read: boolean | null = await this.rbacService.isReadRole(
        admin_token.roleType.id as UUID,
      );

      if (!role_read) {
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
      }

      const admin = await this.databaseService.systemAdmin.findUnique({
        where: { id: id },
      });

      if (!admin) {
        throw new HttpException("Admin not found", HttpStatus.NOT_FOUND);
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          "Internal Server Error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async create(
    admin_token: AdminTokenDto,
    data_admin: CreateAdminDto,
  ): Promise<AdminDto> {
    try {
      if (!admin_token) {
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
      }

      const role_create: boolean | null = await this.rbacService.isCreateRole(
        admin_token.roleType.id as UUID,
      );

      if (role_create === null || !role_create)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      const hash_password = await this.hashPassword(data_admin.password);
      const new_admin = await this.databaseService.systemAdmin.create({
        data: {
          email: data_admin.email,
          name: data_admin.name,
          password: hash_password,
        },
      });

      const roles = await this.rbacService.insertInnitialRoles(new_admin.id);

      if (!roles) {
        throw new HttpException(
          "Error assigning roles to admin",
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        id: new_admin.id,
        email: new_admin.email,
        name: new_admin.name,
        createdAt: new_admin.createdAt,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new HttpException("Email already in use", HttpStatus.CONFLICT);
      }

      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          "Internal Server Error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async update(
    admin_token: AdminTokenDto,
    id: UUID,
    admin: UpdateAdminDto,
  ): Promise<AdminDto> {
    try {
      if (!admin_token) {
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
      }

      const role_update: boolean | null = await this.rbacService.isUpdateRole(
        admin_token.roleType.id as UUID,
      );

      if (role_update === null || !role_update)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

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
          name: admin.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      return updated_admin;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new HttpException("Email already in use", HttpStatus.CONFLICT);
      }

      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          "Internal Server Error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async delete(
    admin_token: AdminTokenDto,
    id: UUID,
  ): Promise<{ message: string }> {
    try {
      if (!admin_token) {
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
      }

      const role_delete: boolean | null = await this.rbacService.isDeleteRole(
        admin_token.roleType.id as UUID,
      );

      if (role_delete === null || !role_delete)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      await this.rbacService.deleteRoles(id);

      await this.databaseService.systemAdmin.delete({
        where: { id: id },
      });

      return { message: "Admin deleted successfully" };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          "Internal Server Error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async authenticate({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<AuthAdminDto> {
    const admin = await this.databaseService.systemAdmin.findUnique({
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
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await this.comparePassword(
      password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    if (!admin.roles || admin.roles.length === 0) {
      throw new HttpException(
        "User has no roles assigned",
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roleType: admin.roles[0].roleType.id,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const match = await bcrypt.compare(password, hash);
    return match;
  }
}
