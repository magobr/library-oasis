import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AdminDto, AdminTokenDto } from "./dto/admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import * as crypto from "crypto";
import { JwtService } from "@nestjs/jwt";

describe("User Controller", () => {
  let admin_controller: AdminController;

  const adminServiceMock = {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    authenticate: jest.fn(),
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

  jest.mock("bcrypt", () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        JwtService,
        {
          provide: AdminService,
          useValue: adminServiceMock,
        },
      ],
    }).compile();

    admin_controller = module.get<AdminController>(AdminController);
  });

  describe("Find Admin", () => {
    it("Deve retornar admin com sucesso", async () => {
      const admin: AdminDto = {
        id: "uuid",
        email: "admin@email.com",
        name: "Admin",
        createdAt: new Date(),
      };

      adminServiceMock.find.mockResolvedValue(admin);

      const result = await admin_controller.getAdmin(
        admin_token,
        "uuid" as crypto.UUID,
      );

      expect(result).toEqual(admin);
    });
  });

  describe("Create Admin", () => {
    const dto: CreateAdminDto = {
      email: "teste@email.com",
      name: "Teste",
      password: "123",
    };

    it("Deve criar admin com sucesso", async () => {
      const response = {
        id: "uuid",
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
      };

      adminServiceMock.create.mockResolvedValue(response);

      const result = await admin_controller.createAdmin(admin_token, dto);

      expect(adminServiceMock.create).toHaveBeenCalledWith(admin_token, dto);
      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.create.mockRejectedValue(error);

      await expect(
        admin_controller.createAdmin(admin_token, {} as CreateAdminDto),
      ).rejects.toThrow(error);
    });
  });

  describe("Update Admin", () => {
    it("Deve atualizar com sucesso", async () => {
      const dto: UpdateAdminDto = { name: "Novo nome" };

      const response = {
        id: "uuid",
        email: "email@email.com",
        name: "Novo nome",
        createdAt: new Date(),
      };

      adminServiceMock.update.mockResolvedValue(response);

      const result = await admin_controller.updateAdmin(
        admin_token,
        "uuid" as crypto.UUID,
        dto,
      );

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.update.mockRejectedValue(error);

      await expect(
        admin_controller.updateAdmin(admin_token, "uuid" as crypto.UUID, {}),
      ).rejects.toThrow(error);
    });
  });

  describe("Delete Admin", () => {
    it("Deve deletar com sucesso", async () => {
      const response = { message: "Admin deleted successfully" };

      adminServiceMock.delete.mockResolvedValue(response);

      const result = await admin_controller.deleteAdmin(
        admin_token,
        "uuid" as crypto.UUID,
      );

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.delete.mockRejectedValue(error);

      await expect(
        admin_controller.deleteAdmin(admin_token, "uuid" as crypto.UUID),
      ).rejects.toThrow(error);
    });
  });

  describe("Authenticate Admin", () => {
    it("Deve autenticar com sucesso", async () => {
      const response = { access_token: "token" };

      adminServiceMock.authenticate.mockResolvedValue(response);

      const result = await admin_controller.authAdmin({
        email: "admin@email.com",
        password: "123",
      });

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("invalid");

      adminServiceMock.authenticate.mockRejectedValue(error);

      await expect(
        admin_controller.authAdmin({} as { email: string; password: string }),
      ).rejects.toThrow(error);
    });
  });
});
