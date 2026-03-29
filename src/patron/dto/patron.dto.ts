import { IsUUID, IsOptional, IsEnum, IsDate } from "class-validator";
import { LoanStatus } from "@prisma/client";
import * as crypto from "crypto";

export class PatronDto {
  @IsUUID()
  id: string;

  @IsDate()
  loan_date: Date;

  @IsOptional()
  @IsDate()
  return_date?: Date | null;

  @IsEnum(LoanStatus, { message: "role_type must be a valid enum value" })
  status: LoanStatus;

  @IsUUID()
  user_id: string;

  @IsUUID()
  book_id: string;
}

export class CreatePatronDto {
  @IsUUID()
  user_id: crypto.UUID;

  @IsUUID()
  book_id: crypto.UUID;
}

export class UpdatePatronDto {
  @IsUUID()
  book_id: crypto.UUID;

  @IsEnum(LoanStatus, { message: "role_type must be a valid enum value" })
  status: LoanStatus;
}
