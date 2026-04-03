import { Test, TestingModule } from "@nestjs/testing";
import { BooksService } from "./books.service";
import { DataBaseService } from "../database/database.service";
import { RbacService } from "../rbac/rbac.service";
import { Prisma } from "@prisma/client";
import { AdminTokenDto } from "../admin/dto/admin.dto";
import { CreateBookDto, UpdateBookDto } from "./dto/book.dto";
import { UUID } from "crypto";

describe("BooksService", () => {
  let service: BooksService;

  const databaseServiceMock = {
    books: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const rbacServiceMock = {
    isCreateRole: jest.fn(),
    isReadRole: jest.fn(),
    isUpdateRole: jest.fn(),
    isDeleteRole: jest.fn(),
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
        BooksService,
        { provide: DataBaseService, useValue: databaseServiceMock },
        { provide: RbacService, useValue: rbacServiceMock },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);

    jest.clearAllMocks();
  });

  describe("addBook", () => {
    const add_book: CreateBookDto = {
      avaliable: true,
      title: "Title",
      author: "Author",
    };

    it("Deve criar livro com sucesso", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      databaseServiceMock.books.create.mockResolvedValue({
        id: "book-id",
      });

      const result = await service.addBook(admin_token, add_book);

      expect(result).toEqual({ id: "book-id" });

      expect(databaseServiceMock.books.create).toHaveBeenCalledWith({
        data: add_book,
      });
    });

    it("Deve erro sem permissão", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(false);

      await expect(service.addBook(admin_token, add_book)).rejects.toThrow(
        "You do not have permission to create books",
      );
    });

    it("Deve apresentar erro generico", async () => {
      rbacServiceMock.isCreateRole.mockResolvedValue(true);

      databaseServiceMock.books.create.mockRejectedValue(new Error());

      await expect(service.addBook(admin_token, add_book)).rejects.toThrow(
        "Internal server error",
      );
    });
  });

  describe("findBookById", () => {
    it("Deve retornar livro", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.books.findUnique.mockResolvedValue({
        id: "book-id",
      });

      const result = await service.findBookById(admin_token, "book-id" as UUID);

      expect(result).toEqual({ id: "book-id" });
    });

    it("Deve erro sem permissão", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(false);

      await expect(
        service.findBookById(admin_token, "id" as UUID),
      ).rejects.toThrow("You do not have permission to read books");
    });

    it("Deve erro book não encontrado", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.books.findUnique.mockResolvedValue(null);

      await expect(
        service.findBookById(admin_token, "id" as UUID),
      ).rejects.toThrow("Book not found");
    });

    it("Deve tratar erro P2025", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "test",
      });

      databaseServiceMock.books.findUnique.mockRejectedValue(error);

      await expect(
        service.findBookById(admin_token, "id" as UUID),
      ).rejects.toThrow("Book not found");
    });

    it("Deve apresentar erro generico", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.books.findUnique.mockRejectedValue(new Error());

      await expect(
        service.findBookById(admin_token, "id" as UUID),
      ).rejects.toThrow("Internal server error");
    });
  });

  describe("findAll", () => {
    it("Deve retornar lista de livros", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.books.findMany.mockResolvedValue([{ id: "1" }]);

      const result = await service.findAll(admin_token);

      expect(result).toEqual({ books: [{ id: "1" }] });
    });

    it("Deve erro sem permissão", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(false);

      await expect(service.findAll(admin_token)).rejects.toThrow(
        "You do not have permission to read books",
      );
    });

    it("Deve tratar erro P2025", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "test",
      });

      databaseServiceMock.books.findMany.mockRejectedValue(error);

      await expect(service.findAll(admin_token)).rejects.toThrow(
        "Book not found",
      );
    });

    it("Deve apresentar erro generico", async () => {
      rbacServiceMock.isReadRole.mockResolvedValue(true);

      databaseServiceMock.books.findMany.mockRejectedValue(new Error());

      await expect(service.findAll(admin_token)).rejects.toThrow(
        "Internal server error",
      );
    });
  });

  describe("updateBook", () => {
    const update_book: UpdateBookDto = {
      author: "Author",
      avaliable: false,
      title: "Title",
    };

    it("Deve atualizar livro", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      databaseServiceMock.books.update.mockResolvedValue({
        id: "book-id",
        title: "Novo",
      });

      const result = await service.updateBook(admin_token, "book-id" as UUID, {
        title: "Novo",
      });

      expect(result).toEqual({
        id: "book-id",
        title: "Novo",
      });
    });

    it("Deve erro sem permissão", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(false);

      await expect(
        service.updateBook(admin_token, "id" as UUID, update_book),
      ).rejects.toThrow("You do not have permission to update books");
    });

    it("Deve tratar erro P2025", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "test",
      });

      databaseServiceMock.books.update.mockRejectedValue(error);

      await expect(
        service.updateBook(admin_token, "id" as UUID, update_book),
      ).rejects.toThrow("Book not found");
    });

    it("Deve apresentar erro generico", async () => {
      rbacServiceMock.isUpdateRole.mockResolvedValue(true);

      databaseServiceMock.books.update.mockRejectedValue(new Error());

      await expect(service.findAll(admin_token)).rejects.toThrow(
        "Internal server error",
      );
    });
  });

  describe("removeBook", () => {
    it("Deve deletar livro", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      databaseServiceMock.books.delete.mockResolvedValue({
        id: "book-id",
      });

      const result = await service.removeBook(admin_token, "book-id" as UUID);

      expect(result).toEqual({
        deleted_book: { id: "book-id" },
        message: "Book deleted successfully",
      });
    });

    it("Deve erro sem permissão", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(false);

      await expect(
        service.removeBook(admin_token, "id" as UUID),
      ).rejects.toThrow("You do not have permission to delete books");
    });

    it("Deve tratar erro P2025", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      const error = new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "test",
      });

      databaseServiceMock.books.delete.mockRejectedValue(error);

      await expect(
        service.removeBook(admin_token, "id" as UUID),
      ).rejects.toThrow("Book not found");
    });

    it("Deve tratar erro generico", async () => {
      rbacServiceMock.isDeleteRole.mockResolvedValue(true);

      databaseServiceMock.books.delete.mockRejectedValue(new Error());

      await expect(
        service.removeBook(admin_token, "id" as UUID),
      ).rejects.toThrow("Internal server error");
    });
  });
});
