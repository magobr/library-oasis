import { IsString } from "class-validator";
import { BookDto } from "./book.dto";

export class BookResponseDto extends BookDto {}

export class AddBookResponseDto extends BookResponseDto {}

export class FindBookByIdResponseDto extends BookResponseDto {}

export class FindAllBooksResponseDto {
  books: BookResponseDto[];
}

export class UpdateBookResponseDto extends BookResponseDto {}

export class RemoveBookResponseDto {
  deleted_book: BookResponseDto;

  @IsString()
  message: string;
}
