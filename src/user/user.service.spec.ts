import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { UserService } from "./user.service";
import { DataBaseService } from "../database/database.service";
import { UserDto } from "./dto/user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { RbacService } from "../rbac/rbac.service";
import { JwtService } from "@nestjs/jwt";

describe("User Service", () => {
  let user_service: UserService;
  let rbacService: RbacService;

  const databaseServiceMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const rbacServiceMock = {
    isReadRole: jest.fn(),
    isCreateRole: jest.fn(),
    isUpdateRole: jest.fn(),
    isDeleteRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        DataBaseService,
        JwtService,
        {
          provide: DataBaseService,
          useValue: databaseServiceMock,
        },
        {
          provide: RbacService,
          useValue: rbacServiceMock,
        },
      ],
    }).compile();

    user_service = module.get<UserService>(UserService);
  });

  describe("Find User", () => {
    const admin_token: AdminTokenDto = {
      id: "admin-id",
      email: "admin@email.com",
      name: "Admin",
      roleType: {
        id: "roleType-id",
      },
      iat: 1234567890,
      exp: 1234567890,
    };
    it("Deve retornar sucesso na busca", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.findUnique.mockReturnValue(user);
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      const result = await user_service.find(
        admin_token,
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" },
      });
    });

    it("Deve retornar erro na busca por não encontrar usuario", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      databaseServiceMock.user.findUnique.mockResolvedValue(null);
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      await expect(
        user_service.find(admin_token, "3caeba63-22ef-482d-96a9-e37b940b5177"),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro quando o id não estiver no formato UUID", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.findUnique.mockReturnValue(exception);

      const result = await user_service.find(admin_token, "12345" as any);

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "12345" },
      });
    });

    it("Deve retornar erro quando o usuário não tiver permissão para consultar", async () => {
      const exception = new HttpException(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
      );

      rbacServiceMock.isReadRole.mockReturnValue(false);

      const result = user_service.find(
        admin_token,
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      await expect(result).rejects.toThrow(exception);
    });
  });

  describe("Create User", () => {
    const admin_token: AdminTokenDto = {
      id: "admin-id",
      email: "admin@email.com",
      name: "Admin",
      roleType: {
        id: "roleType-id",
      },
      iat: 1234567890,
      exp: 1234567890,
    };
    it("Deve retornar sucesso na criacao", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.create = jest.fn().mockReturnValue(user);
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      const result = await user_service.create(admin_token, {
        email: "thiago@email.com",
        name: "Thiago Novaes",
      });

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "thiago@email.com",
          name: "Thiago Novaes",
        },
      });
    });

    it("Deve retornar erro de email duplicado na criacao", async () => {
      const exception = new HttpException(
        "Email already in use",
        HttpStatus.CONFLICT,
      );

      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2002",
          clientVersion: "test",
        },
      );

      databaseServiceMock.user.create.mockRejectedValue(error);
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      await expect(
        user_service.create(admin_token, {
          email: "thiago@email.com",
          name: "Thiago Novaes",
        }),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro generico na criacao", async () => {
      const exception = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.create.mockRejectedValue(new Error());
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      await expect(
        user_service.create(admin_token, {
          email: "thiago@email.com",
          name: "Thiago Novaes",
        }),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro por não ter permissão para criar usuário", async () => {
      const exception = new HttpException(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
      );

      rbacServiceMock.isCreateRole.mockResolvedValue(false);

      await expect(
        user_service.create(admin_token, {
          email: "thiago@email.com",
          name: "Thiago Novaes",
        }),
      ).rejects.toThrow(exception);
    });
  });

  describe("Update User", () => {
    const admin_token: AdminTokenDto = {
      id: "admin-id",
      email: "admin@email.com",
      name: "Admin",
      roleType: {
        id: "roleType-id",
      },
      iat: 1234567890,
      exp: 1234567890,
    };
    it("Deve retornar sucesso na atualizacao", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "teste@teste.com",
        name: "Teste Atualizado",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.update = jest.fn().mockReturnValue(user);
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      const result = await user_service.update(
        admin_token,
        "3caeba63-22ef-482d-96a9-e37b940b5177",
        {
          name: "Teste Atualizado",
        },
      );

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        },
        data: {
          name: "Teste Atualizado",
        },
      });
    });

    it("Deve retornar erro de usuario nao encontrado na atualizacao", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2025",
          clientVersion: "test",
        },
      );

      databaseServiceMock.user.update.mockRejectedValue(error);
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      await expect(
        user_service.update(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
          {
            name: "Teste Atualizado",
          },
        ),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro generico na atualizacao", async () => {
      const exception = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.update.mockRejectedValue(new Error());
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      await expect(
        user_service.update(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
          {
            name: "Teste Atualizado",
          },
        ),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro por não ter permissão para criar atualizar", async () => {
      const exception = new HttpException(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
      );

      rbacServiceMock.isUpdateRole.mockResolvedValue(false);

      await expect(
        user_service.update(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
          {
            name: "Teste Atualizado",
          },
        ),
      ).rejects.toThrow(exception);
    });
  });

  describe("Delete User", () => {
    const admin_token: AdminTokenDto = {
      id: "admin-id",
      email: "admin@email.com",
      name: "Admin",
      roleType: {
        id: "roleType-id",
      },
      iat: 1234567890,
      exp: 1234567890,
    };

    it("Deve retornar sucesso na exclusao", async () => {
      const returnMessage = { message: "User deleted successfully" };

      databaseServiceMock.user.delete.mockResolvedValue(returnMessage);
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      const result = await user_service.delete(
        admin_token,
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(returnMessage);
    });

    it("Deve retornar erro por usuario nao encontrado na exclusao", async () => {
      const returnMessage = new HttpException(
        "Internal server error",
        HttpStatus.NOT_FOUND,
      );

      databaseServiceMock.user.delete.mockRejectedValue(new Error());
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      await expect(
        user_service.delete(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
        ),
      ).rejects.toThrow(returnMessage);
    });

    it("Deve retornar erro generico na exclusao", async () => {
      const returnMessage = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.delete.mockRejectedValue(new Error());
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      await expect(
        user_service.delete(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
        ),
      ).rejects.toThrow(returnMessage);
    });

    it("Deve retornar erro por não ter acesso a exclusão", async () => {
      const returnMessage = new HttpException(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
      );

      rbacServiceMock.isDeleteRole.mockResolvedValue(false);

      await expect(
        user_service.delete(
          admin_token,
          "3caeba63-22ef-482d-96a9-e37b940b5177",
        ),
      ).rejects.toThrow(returnMessage);
    });
  });
});
