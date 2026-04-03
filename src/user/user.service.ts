import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UUID } from "crypto";
import { DataBaseService } from "../database/database.service";
import { UserDto } from "./dto/user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Prisma } from "@prisma/client";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { RbacService } from "../rbac/rbac.service";

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly rbacService: RbacService,
  ) {}

  async find(admin_token: AdminTokenDto, id: UUID): Promise<UserDto> {
    try {
      if (!admin_token)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      const role_read = await this.rbacService.isReadRole(
        admin_token.roleType.id as UUID,
      );

      if (!role_read)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      const search_user = await this.databaseService.user.findUnique({
        where: {
          id: id,
        },
      });

      if (typeof search_user !== "object" || search_user === null) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      return search_user;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(
    admin_token: AdminTokenDto,
    user: CreateUserDto,
  ): Promise<UserDto> {
    try {
      if (!admin_token)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      const role_create = await this.rbacService.isCreateRole(
        admin_token.roleType.id as UUID,
      );

      if (!role_create)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      const new_user = await this.databaseService.user.create({
        data: {
          ...user,
        },
      });
      return new_user;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new HttpException("Email already in use", HttpStatus.CONFLICT);
      }

      if (e instanceof HttpException) throw e;

      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    admin_token: AdminTokenDto,
    id: UUID,
    user: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      const role_update = await this.rbacService.isUpdateRole(
        admin_token.roleType.id as UUID,
      );

      if (!role_update)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

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
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;

      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(
    admin_token: AdminTokenDto,
    id: UUID,
  ): Promise<{ message: string }> {
    try {
      const role_delete = await this.rbacService.isDeleteRole(
        admin_token.roleType.id as UUID,
      );

      if (!role_delete)
        throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      await this.databaseService.user.delete({
        where: { id: id },
      });

      return {
        message: "User deleted successfully",
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;

      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
