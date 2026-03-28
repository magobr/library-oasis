import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Put,
} from "@nestjs/common";
import * as crypto from "crypto";
import { AdminGuard } from "src/admin/admin.guard";
import { BooksService } from "src/books/books.service";
import { CreateBookDto, UpdateBookDto } from "src/books/dto/book.dto";
import { AdminToken } from "src/admin/admin.decorator";
import { AdminTokenDto } from "src/admin/dto/admin.dto";
import {
  AddBookResponseDto,
  FindAllBooksResponseDto,
  FindBookByIdResponseDto,
  UpdateBookResponseDto,
  RemoveBookResponseDto,
} from "./dto/book_response.dto";

@UseGuards(AdminGuard)
@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(
    @AdminToken() adminToken: AdminTokenDto,
    @Body() book: CreateBookDto,
  ): Promise<AddBookResponseDto> {
    return this.booksService.addBook(adminToken, book);
  }

  @Get()
  findAll(
    @AdminToken() adminToken: AdminTokenDto,
  ): Promise<FindAllBooksResponseDto> {
    return this.booksService.findAll(adminToken);
  }

  @Get(":id")
  findById(
    @AdminToken() adminToken: AdminTokenDto,
    @Param("id") id: crypto.UUID,
  ): Promise<FindBookByIdResponseDto> {
    return this.booksService.findBookById(adminToken, id);
  }

  @Put(":id")
  update(
    @AdminToken() adminToken: AdminTokenDto,
    @Body() book: UpdateBookDto,
    @Param("id") id: crypto.UUID,
  ): Promise<UpdateBookResponseDto> {
    return this.booksService.updateBook(adminToken, id, book);
  }

  @Delete(":id")
  remove(
    @AdminToken() adminToken: AdminTokenDto,
    @Param("id") id: crypto.UUID,
  ): Promise<RemoveBookResponseDto> {
    return this.booksService.removeBook(adminToken, id);
  }
}
