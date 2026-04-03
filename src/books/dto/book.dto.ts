import {
  IsUUID,
  IsString,
  IsOptional,
  IsDate,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { PartialType } from "@nestjs/mapped-types";

export class BookDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  author?: string | null;

  @IsBoolean()
  avaliable: boolean;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsBoolean()
  avaliable: boolean;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}
