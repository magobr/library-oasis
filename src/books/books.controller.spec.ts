import { Test, TestingModule } from "@nestjs/testing";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import { AdminTokenDto } from "src/admin/dto/admin.dto";
import { CreateBookDto, UpdateBookDto } from "./dto/book.dto";
import { JwtService } from "@nestjs/jwt";
import { UUID } from "crypto";

describe("BooksController", () => {
  let controller: BooksController;

  const booksServiceMock = {
    addBook: jest.fn(),
    findAll: jest.fn(),
    findBookById: jest.fn(),
    updateBook: jest.fn(),
    removeBook: jest.fn(),
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
      controllers: [BooksController],
      providers: [
        JwtService,
        {
          provide: BooksService,
          useValue: booksServiceMock,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);

    jest.clearAllMocks();
  });

  describe("create", () => {
    const data_book: CreateBookDto = {
      avaliable: true,
      title: "Title",
      author: "Author",
    };

    it("Deve adicionar livro com sucesso", async () => {
      const response = { id: "book-id" };

      booksServiceMock.addBook.mockResolvedValue(response);

      const result = await controller.create(admin_token, data_book);

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      booksServiceMock.addBook.mockRejectedValue(new Error("erro"));

      await expect(controller.create(admin_token, data_book)).rejects.toThrow(
        "erro",
      );
    });
  });

  describe("findAll", () => {
    it("Deve retornar lista de livros", async () => {
      const response = { books: [{ id: "1" }] };

      booksServiceMock.findAll.mockResolvedValue(response);

      const result = await controller.findAll(admin_token);

      expect(result).toEqual(response);
    });
  });

  describe("findById", () => {
    it("Deve retornar livro por id", async () => {
      const id = "uuid-book";

      const response = { id };

      booksServiceMock.findBookById.mockResolvedValue(response);

      const result = await controller.findById(admin_token, id as UUID);

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      booksServiceMock.findBookById.mockRejectedValue(new Error("erro"));

      await expect(
        controller.findById(admin_token, "id" as UUID),
      ).rejects.toThrow("erro");
    });
  });

  describe("update", () => {
    const data_book_update: UpdateBookDto = {
      author: "Author",
      avaliable: true,
      title: "Title",
    };

    const id_book = "uuid-book" as UUID;

    it("Deve atualizar livro com sucesso", async () => {
      const response = { id_book, data_book_update };

      booksServiceMock.updateBook.mockResolvedValue(response);

      const result = await controller.update(
        admin_token,
        data_book_update,
        id_book,
      );

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      booksServiceMock.updateBook.mockRejectedValue(new Error("erro"));

      await expect(
        controller.update(admin_token, data_book_update, id_book),
      ).rejects.toThrow("erro");
    });
  });

  describe("remove", () => {
    const id_book = "uuid-book" as UUID;

    it("Deve remover livro com sucesso", async () => {
      const response = { message: "Livro removido" };

      booksServiceMock.removeBook.mockResolvedValue(response);

      const result = await controller.remove(admin_token, id_book);

      expect(result).toEqual(response);
    });

    it("Deve propagar erro", async () => {
      booksServiceMock.removeBook.mockRejectedValue(new Error("erro"));

      await expect(controller.remove(admin_token, id_book)).rejects.toThrow(
        "erro",
      );
    });
  });
});
