import {
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';

class Roles {
  @IsOptional()
  @IsBoolean()
  create: boolean;

  @IsOptional()
  @IsBoolean()
  read: boolean;

  @IsOptional()
  @IsBoolean()
  update: boolean;

  @IsOptional()
  @IsBoolean()
  delete: boolean;
}

enum RoleName {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class UpdateRoleRbacDto {
  @IsOptional()
  @IsEnum(RoleName, { message: 'role_type must be a valid enum value' })
  role_type: RoleName;

  @Type(() => Roles)
  roles: Roles;
}