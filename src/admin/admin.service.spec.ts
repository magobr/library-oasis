import { Test, TestingModule } from "@nestjs/testing";
import * as crypto from "crypto";
import { AdminService } from "./admin.service";
import { DataBaseService } from "../database/database.service";
import { RbacService } from "../rbac/rbac.service";
import { JwtService } from "@nestjs/jwt";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AdminTokenDto } from "./dto/admin.dto";

jest.mock("bcrypt");

describe("AdminService", () => {
  let service: AdminService;

  const databaseServiceMock = {
    systemAdmin: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const rbacServiceMock = {
    insertInnitialRoles: jest.fn(),
    deleteRoles: jest.fn(),
    isReadRole: jest.fn(),
    isCreateRole: jest.fn(),
    isDeleteRole: jest.fn(),
    isUpdateRole: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        JwtService,
        { provide: DataBaseService, useValue: databaseServiceMock },
        { provide: RbacService, useValue: rbacServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  describe("find", () => {
    const adminMock = {
      id: "1",
      email: "test@test.com",
      name: "Test",
      createdAt: new Date(),
    };

    it("deve retornar admin", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue(adminMock);

      const result = await service.find(admin_token, "1" as crypto.UUID);

      expect(result).toEqual(adminMock);
    });

    it("deve lançar erro se não encontrar", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue(null);

      await expect(
        service.find(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow(
        new HttpException("Admin not found", HttpStatus.NOT_FOUND),
      );
    });

    it("Deve lançar erro de permissão de leitura", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(false);

      await expect(
        service.find(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow(
        new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED),
      );
    });

    it("Deve lançar erro genérico", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.findUnique.mockRejectedValue(new Error());

      await expect(
        service.find(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow(
        new HttpException(
          "Internal Server Error",
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe("create", () => {
    const data_create_admin: CreateAdminDto = {
      email: "test@test.com",
      name: "Test",
      password: "123",
    };
    it("deve criar admin com sucesso", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      databaseServiceMock.systemAdmin.create.mockResolvedValue({
        id: "1",
        email: data_create_admin.email,
        name: data_create_admin.name,
        createdAt: new Date(),
      });

      rbacServiceMock.insertInnitialRoles.mockResolvedValue(true);

      const result = await service.create(admin_token, data_create_admin);

      expect(result.email).toBe(data_create_admin.email);
      expect(rbacServiceMock.insertInnitialRoles).toHaveBeenCalled();
    });

    it("deve lançar erro se email já existir (P2002)", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2002",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.create.mockRejectedValue(error);

      await expect(
        service.create(admin_token, data_create_admin),
      ).rejects.toMatchObject({
        response: "Email already in use",
        status: 409,
      });
    });

    it("deve lançar erro se roles falharem", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

      databaseServiceMock.$transaction.mockImplementation(
        async (cb: () => Promise<unknown>) => {
          return cb();
        },
      );

      databaseServiceMock.systemAdmin.create.mockResolvedValue({
        id: "1",
      });

      rbacServiceMock.insertInnitialRoles.mockResolvedValue(null);

      await expect(
        service.create(admin_token, data_create_admin),
      ).rejects.toThrow("Error assigning roles to admin");
    });

    it("Deve lançar erro de permissão de criar admin", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(false);

      await expect(
        service.create(admin_token, data_create_admin),
      ).rejects.toThrow(
        new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED),
      );
    });

    it("deve lançar erro genérico", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.create.mockRejectedValue(new Error());

      await expect(
        service.create(admin_token, data_create_admin),
      ).rejects.toThrow("Internal Server Error");
    });
  });

  describe("update", () => {
    it("deve atualizar admin", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.update.mockResolvedValue({
        id: "1",
        email: "new@test.com",
        name: "New",
        createdAt: new Date(),
      });

      const result = await service.update(admin_token, "1" as crypto.UUID, {
        email: "new@test.com",
        name: "New",
      });

      expect(result.email).toBe("new@test.com");
    });

    it("deve atualizar senha se enviada", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

      databaseServiceMock.systemAdmin.update.mockResolvedValue({
        id: "1",
        email: "test",
        name: "test",
        createdAt: new Date(),
      });

      await service.update(
        admin_token,
        "1" as crypto.UUID,
        {
          password: "123",
        } as UpdateAdminDto,
      );

      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it("deve lançar erro P2025", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);
      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2025",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.update.mockRejectedValue(error);

      await expect(
        service.update(admin_token, "1" as crypto.UUID, {} as UpdateAdminDto),
      ).rejects.toThrow("User not found");
    });

    it("deve lançar erro de permissão para atualizar usuário", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(false);

      await expect(
        service.update(admin_token, "1" as crypto.UUID, {} as UpdateAdminDto),
      ).rejects.toThrow("Unauthorized");
    });

    it("deve lançar erro genérico", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.update.mockRejectedValue(new Error());

      await expect(
        service.update(admin_token, "1" as crypto.UUID, {} as UpdateAdminDto),
      ).rejects.toThrow("Internal Server Error");
    });
  });

  describe("delete", () => {
    it("deve deletar admin", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.delete.mockResolvedValue(true);

      const result = await service.delete(admin_token, "1" as crypto.UUID);

      expect(result.message).toBe("Admin deleted successfully");
    });

    it("deve lançar erro P2025", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);
      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2025",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.delete.mockRejectedValue(error);

      await expect(
        service.delete(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow("User not found");
    });

    it("deve lançar erro de permissão", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(false);

      await expect(
        service.delete(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow("Unauthorized");
    });

    it("deve lançar erro genérico", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.delete.mockRejectedValue(new Error());

      await expect(
        service.delete(admin_token, "1" as crypto.UUID),
      ).rejects.toThrow("Internal Server Error");
    });
  });

  describe("authenticate", () => {
    it("deve autenticar com sucesso", async () => {
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue({
        id: "1",
        email: "test@test.com",
        name: "Test",
        password: "hashed",
        roles: [
          {
            id: "role1",
            roleType: { id: "type1" },
          },
        ],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtServiceMock.signAsync.mockResolvedValue("token");

      const result = await service.authenticate({
        email: "test@test.com",
        password: "123",
      });

      expect(result).toEqual({ access_token: "token" });
    });

    it("deve falhar se usuário não existir", async () => {
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue(null);

      await expect(
        service.authenticate({ email: "x", password: "x" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("deve falhar se senha inválida", async () => {
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue({
        password: "hashed",
        roles: [{ id: "1", roleType: { id: "1" } }],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.authenticate({ email: "x", password: "x" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("deve falhar se não tiver roles", async () => {
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue({
        password: "hashed",
        roles: [],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.authenticate({ email: "x", password: "x" }),
      ).rejects.toThrow("User has no roles assigned");
    });
  });
});
