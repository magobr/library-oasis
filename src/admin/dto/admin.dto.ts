import {
  IsEmail,
  IsString,
  IsUUID,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Expose } from "class-transformer";

class RoleTypeDto {
  @IsUUID()
  id: string;
}

export class AdminDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date | null;
}

export class AdminTokenDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @ValidateNested()
  roleType: RoleTypeDto;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
