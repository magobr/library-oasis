import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UUID } from "crypto";
import { AdminTokenDto } from "src/admin/dto/admin.dto";
import { BooksService } from "src/books/books.service";
import { DataBaseService } from "src/database/database.service";
import { RbacService } from "src/rbac/rbac.service";
import { CreatePatronDto, UpdatePatronDto } from "./dto/patron.dto";
import {
  AddPatronResponseDto,
  FindManyPatronResponseDto,
  UpdatePatronResponseDto,
} from "./dto/patron_response.dto";

@Injectable()
export class PatronService {
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly bookService: BooksService,
    private readonly rbacService: RbacService,
  ) {}

  async addPatron(
    adminToken: AdminTokenDto,
    patron: CreatePatronDto,
  ): Promise<AddPatronResponseDto> {
    try {
      const is_create = await this.rbacService.isCreateRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_create)
        throw new HttpException(
          "Sem permissão para criar um empréstimo",
          HttpStatus.FORBIDDEN,
        );

      const is_borrowed = await this.bookService.findBookById(
        adminToken,
        patron.book_id,
      );

      if (!is_borrowed.avaliable)
        throw new HttpException("Livro já emprestado", HttpStatus.BAD_REQUEST);

      const is_capacity = await this.databaseService.userBooks.count({
        where: { user_id: patron.user_id, status: "LOANED" },
      });

      if (is_capacity >= 5)
        throw new HttpException(
          "Limite de empréstimos atingido",
          HttpStatus.BAD_REQUEST,
        );

      await this.bookService.updateBook(adminToken, patron.book_id, {
        avaliable: false,
      });

      return await this.databaseService.userBooks.create({
        data: {
          loan_date: new Date(),
          status: "LOANED",
          user_id: patron.user_id,
          book_id: patron.book_id,
        },
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException("Erro interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async find(adminToken: AdminTokenDto): Promise<FindManyPatronResponseDto> {
    try {
      const is_read = await this.rbacService.isReadRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_read)
        throw new HttpException(
          "Sem permissão para consultar empréstimos",
          HttpStatus.FORBIDDEN,
        );

      const books = await this.databaseService.userBooks.findMany();
      return { books };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException("Erro interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByBookId(
    adminToken: AdminTokenDto,
    bookId: UUID,
  ): Promise<FindManyPatronResponseDto> {
    try {
      const is_read = await this.rbacService.isReadRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_read)
        throw new HttpException(
          "Sem permissão para consultar empréstimos",
          HttpStatus.FORBIDDEN,
        );

      const books = await this.databaseService.userBooks.findMany({
        where: { book_id: bookId },
      });
      return { books };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException("Erro interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByUserId(
    adminToken: AdminTokenDto,
    userId: UUID,
  ): Promise<FindManyPatronResponseDto> {
    try {
      const is_read = await this.rbacService.isReadRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_read)
        throw new HttpException(
          "Sem permissão para consultar empréstimos",
          HttpStatus.FORBIDDEN,
        );

      const books = await this.databaseService.userBooks.findMany({
        where: { user_id: userId },
      });
      return { books };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException("Erro interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatusPatron(
    adminToken: AdminTokenDto,
    patronId: UUID,
    patron: UpdatePatronDto,
  ): Promise<UpdatePatronResponseDto> {
    try {
      const is_create = await this.rbacService.isCreateRole(
        adminToken.roleType.id as UUID,
      );

      if (!is_create)
        throw new HttpException(
          "Sem permissão para atualizar empréstimos",
          HttpStatus.FORBIDDEN,
        );

      const updatedPatron = await this.databaseService.userBooks.update({
        where: { id: patronId, status: "LOANED", return_date: null },
        data: {
          return_date: new Date(),
          status: patron.status,
        },
      });

      if (patron.status === "RETURNED") {
        await this.bookService.updateBook(adminToken, patron.book_id, {
          avaliable: true,
        });
      }

      return updatedPatron;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new HttpException(
          "Empréstimo não encontrado",
          HttpStatus.NOT_FOUND,
        );
      }

      if (e instanceof HttpException) throw e;
      throw new HttpException("Erro interno", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
