import { Test, TestingModule } from "@nestjs/testing";
import { PatronService } from "./patron.service";
import { DataBaseService } from "../database/database.service";
import { BooksService } from "../books/books.service";
import { RbacService } from "../rbac/rbac.service";
import { Prisma } from "@prisma/client";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { CreatePatronDto, UpdatePatronDto } from "./dto/patron.dto";
import { UUID } from "crypto";
import { UpdateBookDto } from "src/books/dto/book.dto";

describe("PatronService", () => {
  let service: PatronService;

  const databaseServiceMock = {
    userBooks: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const booksServiceMock = {
    findBookById: jest.fn(),
    updateBook: jest.fn(),
  };

  const rbacServiceMock = {
    isCreateRole: jest.fn(),
    isReadRole: jest.fn(),
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
        PatronService,
        { provide: DataBaseService, useValue: databaseServiceMock },
        { provide: BooksService, useValue: booksServiceMock },
        { provide: RbacService, useValue: rbacServiceMock },
      ],
    }).compile();

    service = module.get<PatronService>(PatronService);

    jest.clearAllMocks();
  });

  describe("addPatron", () => {
    const patron_mock: CreatePatronDto = {
      book_id: "asd" as UUID,
      user_id: "123" as UUID,
    };

    const update_book_mock: UpdateBookDto = {
      avaliable: false,
    };

    it("Deve criar empréstimo com sucesso", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      booksServiceMock.findBookById.mockResolvedValue({
        avaliable: true,
      });

      databaseServiceMock.userBooks.count.mockResolvedValue(0);

      databaseServiceMock.userBooks.create.mockResolvedValue({
        id: "patron-id",
      });

      const result = await service.addPatron(admin_token, patron_mock);

      expect(result).toEqual({ id: "patron-id" });

      expect(booksServiceMock.updateBook).toHaveBeenCalledWith(
        admin_token,
        patron_mock.book_id,
        update_book_mock,
      );
    });

    it("Deve apresentar de erro sem permissão para criar um emprestimo", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(false);

      await expect(
        service.addPatron(admin_token, {} as CreatePatronDto),
      ).rejects.toThrow("Sem permissão para criar um empréstimo");
    });

    it("Deve apresentar de erro livro já emprestado", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      booksServiceMock.findBookById.mockResolvedValue({
        avaliable: false,
      });

      await expect(
        service.addPatron(admin_token, {} as CreatePatronDto),
      ).rejects.toThrow("Livro já emprestado");
    });

    it("Deve apresentar de erro limite atingido", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      booksServiceMock.findBookById.mockResolvedValue({
        avaliable: true,
      });

      databaseServiceMock.userBooks.count.mockResolvedValue(5);

      await expect(
        service.addPatron(admin_token, {} as CreatePatronDto),
      ).rejects.toThrow("Limite de empréstimos atingido");
    });
  });

  describe("find", () => {
    it("Deve retornar lista com sucesso", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.userBooks.findMany.mockResolvedValue([{ id: "1" }]);

      const result = await service.find(admin_token);

      expect(result).toEqual({ books: [{ id: "1" }] });
    });

    it("Deve apresentar erro de sem permissão para consultar", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(false);

      await expect(service.find(admin_token)).rejects.toThrow(
        "Sem permissão para consultar empréstimos",
      );
    });
  });

  describe("findByBookId", () => {
    it("Deve retornar por bookId", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.userBooks.findMany.mockResolvedValue([{ id: "1" }]);

      const result = await service.findByBookId(admin_token, "book-id" as UUID);

      expect(result).toEqual({ books: [{ id: "1" }] });
    });
  });

  describe("findByUserId", () => {
    it("Deve retornar por userId", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.userBooks.findMany.mockResolvedValue([{ id: "1" }]);

      const result = await service.findByUserId(admin_token, "user-id" as UUID);

      expect(result).toEqual({ books: [{ id: "1" }] });
    });
  });

  describe("updateStatusPatron", () => {
    const data_update: UpdatePatronDto = {
      status: "RETURNED",
      book_id: "book-id" as UUID,
    };

    it("Deve atualizar status com sucesso", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      databaseServiceMock.userBooks.update.mockResolvedValue({
        id: "patron-id",
        status: "RETURNED",
      });

      const result = await service.updateStatusPatron(
        admin_token,
        "patron-id" as UUID,
        data_update,
      );

      expect(result).toEqual({
        id: "patron-id",
        status: "RETURNED",
      });

      expect(booksServiceMock.updateBook).toHaveBeenCalledWith(
        admin_token,
        "book-id",
        { avaliable: true },
      );
    });

    it("Deve apresentar erro de sem permissão", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(false);

      await expect(
        service.updateStatusPatron(
          admin_token,
          "patron-id" as UUID,
          data_update,
        ),
      ).rejects.toThrow("Sem permissão para atualizar empréstimos");
    });

    it("Deve apresentar erro not found (P2025)", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "test",
      });

      databaseServiceMock.userBooks.update.mockRejectedValue(error);

      await expect(
        service.updateStatusPatron(
          admin_token,
          "patron-id" as UUID,
          data_update,
        ),
      ).rejects.toThrow("Empréstimo não encontrado");
    });
  });
});
