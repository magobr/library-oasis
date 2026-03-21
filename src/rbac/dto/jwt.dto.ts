import { IsEmail, IsString, IsUUID, IsNumber } from "class-validator";

export class JwtPayload {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
