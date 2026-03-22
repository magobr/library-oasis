import { Test, TestingModule } from "@nestjs/testing";
import { UserDto } from "./dto/user.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { UUID } from "node:crypto";

describe("User controller", () => {
  let user_controller: UserController;

  const userServiceMock = {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserController,
        UserService,
        JwtService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    user_controller = module.get<UserController>(UserController);
  });

  describe("Find User", () => {
    it("Deve retornar sucesso na busca", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      jest.spyOn(user_controller, "getUser").mockResolvedValue(user);

      const result = await user_controller.getUser(
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(user);
    });

    it("Deve retornar erro na busca", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      userServiceMock.find.mockRejectedValue(exception);

      const result = user_controller.getUser("uui" as UUID);

      await expect(result).rejects.toThrow(exception);
    });
  });

  describe("Create User", () => {
    it("Deve criar um usuário com sucesso", async () => {
      const user: UserDto = {
        id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        email: "thiago@email.com",
        name: "Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z"),
      };

      userServiceMock.create.mockResolvedValue(user);

      const result = await user_controller.createUser({
        email: "thiago@email.com",
        name: "Thiago Novaes",
      });

      expect(result).toEqual(user);
    });

    it("Deve retornar erro ao criar usuário com email já existente", async () => {
      const exception = new HttpException(
        "Email already exists",
        HttpStatus.CONFLICT,
      );

      userServiceMock.create.mockRejectedValue(exception);

      const result = user_controller.createUser({
        email: "thiago@email.com",
        name: "Thiago Novaes",
      });

      await expect(result).rejects.toThrow(exception);
    });

    it("Deve retornar erro generico na criacao", async () => {
      const exception = new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      userServiceMock.create.mockRejectedValue(exception);

      const result = user_controller.createUser({
        email: "thiago@email.com",
        name: "Thiago Novaes",
      });

      await expect(result).rejects.toThrow(exception);
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

      userServiceMock.update.mockResolvedValue(user);
      const result = await user_controller.updateUser(
        "3caeba63-22ef-482d-96a9-e37b940b5177",
        {
          name: "Teste Atualizado",
        },
      );

      expect(result).toEqual(user);
    });

    it("Deve retornar erro de usuario nao encontrado na atualizacao", async () => {
      const exception = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      userServiceMock.update.mockRejectedValue(exception);

      await expect(
        user_controller.updateUser("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado",
        }),
      ).rejects.toThrow(exception);
    });

    it("Deve retornar erro generico na atualizacao", async () => {
      const exception = new HttpException(
        "Error updating user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      userServiceMock.update.mockRejectedValue(exception);

      await expect(
        user_controller.updateUser("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado",
        }),
      ).rejects.toThrow(exception);
    });
  });

  describe("Delete User", () => {
    it("Deve retornar sucesso na exclusao", async () => {
      const returnMessage = { message: "User deleted successfully" };

      userServiceMock.delete.mockReturnValue(returnMessage);
      const result = await user_controller.deleteUser(
        "3caeba63-22ef-482d-96a9-e37b940b5177",
      );

      expect(result).toEqual(returnMessage);
    });

    it("Deve retornar erro por usuario nao encontrado na exclusao", async () => {
      const returnMessage = new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

      userServiceMock.delete.mockRejectedValue(returnMessage);

      await expect(
        user_controller.deleteUser("3caeba63-22ef-482d-96a9-e37b940b5177"),
      ).rejects.toThrow(returnMessage);
    });

    it("Deve retornar erro generico na exclusao", async () => {
      const returnMessage = new HttpException(
        "Error deleting user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      userServiceMock.delete.mockRejectedValue(returnMessage);

      await expect(
        user_controller.deleteUser("3caeba63-22ef-482d-96a9-e37b940b5177"),
      ).rejects.toThrow(returnMessage);
    });
  });
});
