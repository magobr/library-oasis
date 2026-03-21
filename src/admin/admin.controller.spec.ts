import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AdminDto } from "./dto/admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import * as crypto from "crypto";

describe("User Controller", () => {
  let admin_controller: AdminController;

  const adminServiceMock = {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    authenticate: jest.fn(),
  };

  jest.mock("bcrypt", () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
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

      const result = await admin_controller.getAdmin("uuid" as crypto.UUID);

      expect(adminServiceMock.find).toHaveBeenCalledWith("uuid");
      expect(result).toEqual(admin);
    });
  });

  describe("Create Admin", () => {
    it("Deve criar admin com sucesso", async () => {
      const dto: CreateAdminDto = {
        email: "teste@email.com",
        name: "Teste",
        password: "123",
      };

      const response = {
        id: "uuid",
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
      };

      adminServiceMock.create.mockResolvedValue(response);

      const result = await admin_controller.createAdmin(dto);

      expect(adminServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.create.mockRejectedValue(error);

      await expect(admin_controller.createAdmin({} as any)).rejects.toThrow(
        error,
      );
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
        "uuid" as crypto.UUID,
        dto,
      );

      expect(adminServiceMock.update).toHaveBeenCalledWith("uuid", dto);
      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.update.mockRejectedValue(error);

      await expect(
        admin_controller.updateAdmin("uuid" as crypto.UUID, {}),
      ).rejects.toThrow(error);
    });
  });

  describe("Delete Admin", () => {
    it("Deve deletar com sucesso", async () => {
      const response = { message: "Admin deleted successfully" };

      adminServiceMock.delete.mockResolvedValue(response);

      const result = await admin_controller.deleteAdmin("uuid" as crypto.UUID);

      expect(adminServiceMock.delete).toHaveBeenCalledWith("uuid");
      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("erro");

      adminServiceMock.delete.mockRejectedValue(error);

      await expect(
        admin_controller.deleteAdmin("uuid" as crypto.UUID),
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

      expect(adminServiceMock.authenticate).toHaveBeenCalledWith({
        email: "admin@email.com",
        password: "123",
      });

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      const error = new Error("invalid");

      adminServiceMock.authenticate.mockRejectedValue(error);

      await expect(admin_controller.authAdmin({} as any)).rejects.toThrow(
        error,
      );
    });
  });
});
