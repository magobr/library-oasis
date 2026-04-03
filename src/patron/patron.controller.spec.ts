import { Test, TestingModule } from "@nestjs/testing";
import { PatronController } from "./patron.controller";
import { PatronService } from "./patron.service";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { AddPatronResponseDto } from "./dto/patron_response.dto";
import { JwtService } from "@nestjs/jwt";
import { CreatePatronDto, UpdatePatronDto } from "./dto/patron.dto";
import { UUID } from "crypto";

describe("PatronController", () => {
  let controller: PatronController;

  const patronServiceMock = {
    addPatron: jest.fn(),
    find: jest.fn(),
    findByBookId: jest.fn(),
    findByUserId: jest.fn(),
    updateStatusPatron: jest.fn(),
  };

  const admin_token_mock: AdminTokenDto = {
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
      controllers: [PatronController],
      providers: [
        JwtService,
        {
          provide: PatronService,
          useValue: patronServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PatronController>(PatronController);

    jest.clearAllMocks();
  });

  describe("addPatron", () => {
    const data = {
      book_id: "book-id" as UUID,
      user_id: "user-id" as UUID,
    } as CreatePatronDto;

    it("Deve adicionar patron com sucesso", async () => {
      const response = { id: "patron-id" } as AddPatronResponseDto;

      patronServiceMock.addPatron.mockResolvedValue(response);

      const result = await controller.addPatron(admin_token_mock, data);

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      patronServiceMock.addPatron.mockRejectedValue(new Error("erro"));

      await expect(
        controller.addPatron(admin_token_mock, data),
      ).rejects.toThrow("erro");
    });
  });

  describe("find", () => {
    it("Deve retornar lista de patrons", async () => {
      const response = [{ id: "patron-id" }];

      patronServiceMock.find.mockResolvedValue(response);

      const result = await controller.find(admin_token_mock);

      expect(result).toEqual(response);
    });
  });

  describe("findByBookId", () => {
    it("Deve retornar patrons por bookId", async () => {
      const bookId = "uuid-book";

      const response = [{ id: "patron-id" }];

      patronServiceMock.findByBookId.mockResolvedValue(response);

      const result = await controller.findByBookId(
        admin_token_mock,
        bookId as UUID,
      );

      expect(result).toEqual(response);
    });
  });

  describe("findByUserId", () => {
    it("Deve retornar patrons por userId", async () => {
      const userId = "uuid-user";

      const response = [{ id: "patron-id" }];

      patronServiceMock.findByUserId.mockResolvedValue(response);

      const result = await controller.findByUserId(
        admin_token_mock,
        userId as UUID,
      );

      expect(result).toEqual(response);
    });
  });

  describe("updatePatron", () => {
    it("Deve atualizar patron com sucesso", async () => {
      const patronId = "uuid-patron";

      const dto = {
        status: "RETURNED",
      };

      const response = { id: patronId, status: "RETURNED" };

      patronServiceMock.updateStatusPatron.mockResolvedValue(response);

      const result = await controller.updatePatron(
        admin_token_mock,
        patronId as UUID,
        dto as UpdatePatronDto,
      );

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      patronServiceMock.updateStatusPatron.mockRejectedValue(new Error("erro"));

      await expect(
        controller.updatePatron(
          {} as AdminTokenDto,
          "id" as UUID,
          {} as UpdatePatronDto,
        ),
      ).rejects.toThrow("erro");
    });
  });
});
