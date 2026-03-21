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
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: DataBaseService, useValue: databaseServiceMock },
        { provide: RbacService, useValue: rbacServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  describe("find", () => {
    it("deve retornar admin", async () => {
      const adminMock = {
        id: "1",
        email: "test@test.com",
        name: "Test",
        createdAt: new Date(),
      };

      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue(adminMock);

      const result = await service.find("1" as crypto.UUID);

      expect(result).toEqual(adminMock);
    });

    it("deve lançar erro se não encontrar", async () => {
      databaseServiceMock.systemAdmin.findUnique.mockResolvedValue(null);

      await expect(service.find("1" as crypto.UUID)).rejects.toThrow(
        new HttpException("Admin not found", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe("create", () => {
    it("deve criar admin com sucesso", async () => {
      const dto = {
        email: "test@test.com",
        name: "Test",
        password: "123",
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

      databaseServiceMock.$transaction.mockImplementation(
        async (cb: () => Promise<unknown>) => {
          return cb();
        },
      );

      databaseServiceMock.systemAdmin.create.mockResolvedValue({
        id: "1",
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
      });

      rbacServiceMock.insertInnitialRoles.mockResolvedValue(true);

      const result = await service.create(dto as CreateAdminDto);

      expect(result.email).toBe(dto.email);
      expect(rbacServiceMock.insertInnitialRoles).toHaveBeenCalled();
    });

    it("deve lançar erro se email já existir (P2002)", async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2002",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.create.mockRejectedValue(error);

      await expect(
        service.create({
          email: "teste@email.com",
          name: "Teste",
          password: "123456",
        } as CreateAdminDto),
      ).rejects.toMatchObject({
        response: "Email already in use",
        status: 409,
      });
    });

    it("deve lançar erro se roles falharem", async () => {
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

      await expect(service.create({} as CreateAdminDto)).rejects.toThrow(
        "Error assigning roles to admin",
      );
    });
  });

  describe("update", () => {
    it("deve atualizar admin", async () => {
      databaseServiceMock.systemAdmin.update.mockResolvedValue({
        id: "1",
        email: "new@test.com",
        name: "New",
        createdAt: new Date(),
      });

      const result = await service.update("1" as crypto.UUID, {
        email: "new@test.com",
        name: "New",
      });

      expect(result.email).toBe("new@test.com");
    });

    it("deve atualizar senha se enviada", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

      databaseServiceMock.systemAdmin.update.mockResolvedValue({
        id: "1",
        email: "test",
        name: "test",
        createdAt: new Date(),
      });

      await service.update(
        "1" as crypto.UUID,
        {
          password: "123",
        } as UpdateAdminDto,
      );

      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it("deve lançar erro P2025", async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2025",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.update.mockRejectedValue(error);

      await expect(
        service.update("1" as crypto.UUID, {} as UpdateAdminDto),
      ).rejects.toThrow("User not found");
    });
  });

  // =========================
  // DELETE
  // =========================
  describe("delete", () => {
    it("deve deletar admin", async () => {
      rbacServiceMock.deleteRoles.mockResolvedValue(true);
      databaseServiceMock.systemAdmin.delete.mockResolvedValue(true);

      const result = await service.delete("1" as crypto.UUID);

      expect(result.message).toBe("Admin deleted successfully");
    });

    it("deve lançar erro P2025", async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint",
        {
          code: "P2025",
          clientVersion: "test",
        },
      );

      databaseServiceMock.systemAdmin.delete.mockRejectedValue(error);

      await expect(service.delete("1" as crypto.UUID)).rejects.toThrow(
        "User not found",
      );
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
