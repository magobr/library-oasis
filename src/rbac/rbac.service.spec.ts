import { Test, TestingModule } from "@nestjs/testing";
import { UUID } from "crypto";
import { RbacService } from "./rbac.service";
import { DataBaseService } from "../database/database.service";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "@prisma/client";
import { InsertRoleRbacDto, RoleName } from "./dto/insert_role-rbac.dto";
import { VerifyRoleRbacDto } from "./dto/verify_roles-rbac.dto";

describe("RbacService", () => {
  let service: RbacService;

  const databaseServiceMock = {
    roleTypes: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    roles: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const jwtServiceMock = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: DataBaseService,
          useValue: databaseServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);

    jest.clearAllMocks();
  });

  describe("insertRole", () => {
    it("Deve inserir role com sucesso", async () => {
      const dto: InsertRoleRbacDto = {
        role_type: RoleName.ADMIN,
        roles: { create: true, read: true, update: true, delete: true },
      };

      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      jest.spyOn(service, "verifyRoles").mockResolvedValue(null);

      databaseServiceMock.roleTypes.create.mockResolvedValue({ id: "type-id" });
      databaseServiceMock.roles.create.mockResolvedValue({ id: "role-id" });

      const result = await service.insertRole(dto, "token");

      expect(result).toEqual({
        message: "Role type and roles inserted successfully",
        role_type: "type-id",
        roles: "role-id",
      });
    });

    it("Deve erro se admin já tiver role", async () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      jest
        .spyOn(service, "verifyRoles")
        .mockResolvedValue({ id: "role-id" } as VerifyRoleRbacDto);

      await expect(
        service.insertRole({} as InsertRoleRbacDto, "token"),
      ).rejects.toThrow("Admin already has a role");
    });
  });

  describe("insertInnitialRoles", () => {
    it("Deve inserir role inicial", async () => {
      databaseServiceMock.roleTypes.findFirst.mockResolvedValue({
        id: "type-id",
      });

      databaseServiceMock.roles.create.mockResolvedValue({
        id: "role-id",
      });

      const result = await service.insertInnitialRoles("uuid");

      expect(result).toEqual({
        message: "Role type and roles inserted successfully",
        role_type: "type-id",
        roles: "role-id",
      });
    });

    it("Deve erro se role USER não existir", async () => {
      databaseServiceMock.roleTypes.findFirst.mockResolvedValue(null);

      await expect(service.insertInnitialRoles("uuid")).rejects.toThrow(
        "Role User NotFount",
      );
    });
  });

  describe("getUserRoles", () => {
    it("Deve retornar roles", async () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      const role = {
        id: "type-id",
        type: "ADMIN",
        create: true,
        read: true,
        update: true,
        delete: true,
      };

      databaseServiceMock.roleTypes.findFirst.mockResolvedValue(role);

      const result = await service.getUserRoles("token");

      expect(result).toEqual(role);
    });

    it("Deve erro se não encontrar roles", async () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      databaseServiceMock.roleTypes.findFirst.mockResolvedValue(null);

      await expect(service.getUserRoles("token")).rejects.toThrow(
        "No roles found for this admin",
      );
    });
  });

  describe("updateRoeles", () => {
    it("Deve atualizar roles com sucesso", async () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      jest.spyOn(service, "verifyRoles").mockResolvedValue({
        id: "role-id",
      } as VerifyRoleRbacDto);

      databaseServiceMock.roles.update.mockResolvedValue({
        id: "role-id",
      });

      const result = await service.updateRoeles(
        {
          role_type: RoleName.ADMIN,
          roles: { create: true, read: true, update: true, delete: true },
        },
        "token",
      );

      expect(result).toEqual({
        message: "Role type and roles inserted successfully",
        roles: "role-id",
      });
    });

    it("Deve erro se não tiver roles", async () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      jest.spyOn(service, "verifyRoles").mockResolvedValue(null);

      await expect(service.updateRoeles({} as any, "token")).rejects.toThrow(
        "No roles found for this admin",
      );
    });
  });

  describe("deleteRoles", () => {
    it("Deve deletar roles com sucesso", async () => {
      jest.spyOn(service, "verifyRoles").mockResolvedValue({
        id: "role-id",
        type_id: "type-id",
      } as Roles);

      databaseServiceMock.roles.delete.mockResolvedValue(undefined);
      databaseServiceMock.roleTypes.delete.mockResolvedValue(undefined);

      const result = await service.deleteRoles("uuid" as UUID);

      expect(result).toEqual({
        message: "Roles deleted successfully",
      });
    });

    it("Deve erro se não encontrar roles", async () => {
      jest.spyOn(service, "verifyRoles").mockResolvedValue(null);

      await expect(service.deleteRoles("uuid" as UUID)).rejects.toThrow(
        "No roles found for this admin",
      );
    });
  });

  describe("verifyRoles", () => {
    it("Deve retornar roles", async () => {
      const role = { id: "role-id" };

      databaseServiceMock.roles.findFirst.mockResolvedValue(role);

      const result = await service.verifyRoles("uuid" as UUID);

      expect(result).toEqual(role);
    });
  });

  describe("verifyTokenSync", () => {
    it("Deve validar token", () => {
      jwtServiceMock.verify.mockReturnValue({ id: "uuid" });

      const result = service.verifyTokenSync("token");

      expect(result).toEqual({ id: "uuid" });
    });
  });
});
