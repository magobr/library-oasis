import {
  IsBoolean,
  IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';

class Roles {
  @IsBoolean()
  create: boolean;

  @IsBoolean()
  read: boolean;

  @IsBoolean()
  update: boolean;

  @IsBoolean()
  delete: boolean;
}

export enum RoleName {
  ADMIN = 'ADMIN',
  USER = 'USER',
  BOOKS = 'BOOKS'
}

export class InsertRoleRbacDto {
  @IsEnum(RoleName, { message: 'role_type must be a valid enum value' })
  role_type: RoleName;

  @Type(() => Roles)
  roles: Roles;
}