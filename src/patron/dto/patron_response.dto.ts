import { IsString } from "class-validator";
import { PatronDto } from "./patron.dto";

export class PatronResponseDto extends PatronDto {}

export class AddPatronResponseDto extends PatronResponseDto {}

export class FindPatronResponseDto extends PatronResponseDto {}

export class FindManyPatronResponseDto {
  books: PatronResponseDto[];
}

export class UpdatePatronResponseDto extends PatronResponseDto {}

export class RemovePatronResponseDto extends PatronResponseDto {
  deleted_patron: PatronResponseDto;

  @IsString()
  message: string;
}
