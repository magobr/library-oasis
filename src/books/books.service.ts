import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataBaseService } from "src/database/database.service";
import { CreateBookDto, UpdateBookDto } from "./dto/book.dto";
import {
  AddBookResponseDto,
  FindBookByIdResponseDto,
  FindAllBooksResponseDto,
  UpdateBookResponseDto,
  RemoveBookResponseDto,
} from "src/books/dto/book_response.dto";
import { AdminTokenDto } from "src/admin/dto/admin.dto";
import { UUID } from "crypto";
import { RbacService } from "src/rbac/rbac.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class BooksService {
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly rbaService: RbacService,
  ) {}

  async addBook(
    adminToken: AdminTokenDto,
    book: CreateBookDto,
  ): Promise<AddBookResponseDto> {
    try {
      const is_create = await this.rbaService.isCreateRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_create)
        throw new HttpException(
          "You do not have permission to create books",
          HttpStatus.FORBIDDEN,
        );

      const new_book = await this.databaseService.books.create({ data: book });
      return new_book;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException("Internal server error", 500);
    }
  }

  async findBookById(
    adminToken: AdminTokenDto,
    id: UUID,
  ): Promise<FindBookByIdResponseDto> {
    try {
      const is_read = await this.rbaService.isReadRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_read)
        throw new HttpException(
          "You do not have permission to read books",
          HttpStatus.FORBIDDEN,
        );

      const book = await this.databaseService.books.findUnique({
        where: { id },
      });

      if (!book) {
        throw new HttpException("Book not found", HttpStatus.NOT_FOUND);
      }

      return book;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("Book not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;
      throw new HttpException("Internal server error", 500);
    }
  }

  async findAll(adminToken: AdminTokenDto): Promise<FindAllBooksResponseDto> {
    try {
      const is_read = await this.rbaService.isReadRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_read)
        throw new HttpException(
          "You do not have permission to read books",
          HttpStatus.FORBIDDEN,
        );

      const books = await this.databaseService.books.findMany();
      return { books };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("Book not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;
      throw new HttpException("Internal server error", 500);
    }
  }

  async updateBook(
    adminToken: AdminTokenDto,
    id: UUID,
    book: UpdateBookDto,
  ): Promise<UpdateBookResponseDto> {
    try {
      const is_update = await this.rbaService.isUpdateRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_update)
        throw new HttpException(
          "You do not have permission to update books",
          HttpStatus.FORBIDDEN,
        );

      const updated_book = await this.databaseService.books.update({
        where: { id },
        data: book,
      });
      return updated_book;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("Book not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;
      throw new HttpException("Internal server error", 500);
    }
  }

  async removeBook(
    adminToken: AdminTokenDto,
    id: UUID,
  ): Promise<RemoveBookResponseDto> {
    try {
      const is_delete = await this.rbaService.isDeleteRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_delete)
        throw new HttpException(
          "You do not have permission to delete books",
          HttpStatus.FORBIDDEN,
        );

      const deleted_book = await this.databaseService.books.delete({
        where: { id },
      });
      return { deleted_book, message: "Book deleted successfully" };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException("Book not found", HttpStatus.NOT_FOUND);
      }

      if (e instanceof HttpException) throw e;
      throw new HttpException("Internal server error", 500);
    }
  }
}
