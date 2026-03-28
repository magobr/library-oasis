import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDate,
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

  @IsInt()
  @Min(0)
  amount: number;

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

  @IsInt()
  @Min(0)
  amount: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}
