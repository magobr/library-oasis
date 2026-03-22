import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { UserService } from "./user.service";
import { DataBaseService } from "../database/database.service";
import { UserDto } from "./dto/user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import e from "express";

describe("User Service", () => {
  let user_service: UserService;

  const databaseServiceMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        DataBaseService,
        {
          provide: DataBaseService,
          useValue: databaseServiceMock,
        },
      ],
    }).compile();

    user_service = module.get<UserService>(UserService);
  });

  describe("Find User", () => {
    it("Deve retornar sucesso na busca", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.findUnique.mockReturnValue(user);

      const result = await user_service.find(
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" },
      });
    });

    it("Deve retornar erro na busca", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      databaseServiceMock.user.findUnique.mockReturnValue(exception);

      const result = await user_service.find(
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" },
      });
    });

    it("Deve retornar erro quando o id não estiver no formato UUID", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.findUnique.mockReturnValue(exception);

      const result = await user_service.find("12345" as any);

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "12345" },
      });
    });
  });

  describe("Create User", () => {
    it("Deve retornar sucesso na criacao", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.create = jest.fn().mockReturnValue(user);
      const result = await user_service.create({
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

      await expect(
        user_service.create({
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

      await expect(
        user_service.create({
          email: "thiago@email.com",
          name: "Thiago Novaes",
        }),
      ).rejects.toThrow(exception);
    });
  });

  describe("Update User", () => {
    it("Deve retornar sucesso na atualizacao", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "teste@teste.com",
        name: "Teste Atualizado",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      databaseServiceMock.user.update = jest.fn().mockReturnValue(user);
      const result = await user_service.update(
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

      await expect(
        user_service.update("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado",
        }),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro generico na atualizacao", async () => {
      const exception = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.update.mockRejectedValue(new Error());

      await expect(
        user_service.update("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado",
        }),
      ).rejects.toThrow(exception);
    });
  });

  describe("Delete User", () => {
    it("Deve retornar sucesso na exclusao", async () => {
      const returnMessage = { message: "User deleted successfully" };

      databaseServiceMock.user.delete.mockResolvedValue(returnMessage);

      const result = await user_service.delete(
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

      await expect(
        user_service.delete("3caeba63-22ef-482d-96a9-e37b940b5177"),
      ).rejects.toThrow(returnMessage);
    });

    it("Deve retornar erro generico na exclusao", async () => {
      const returnMessage = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      databaseServiceMock.user.delete.mockRejectedValue(new Error());

      await expect(
        user_service.delete("3caeba63-22ef-482d-96a9-e37b940b5177"),
      ).rejects.toThrow(returnMessage);
    });
  });
});
