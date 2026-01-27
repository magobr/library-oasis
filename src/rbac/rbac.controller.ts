import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { RbacService } from './rbac.service';
import { InsertRoleRbacDto } from './dto/insert_role-rbac.dto';
import { AdminDecorator } from '../admin/admin.decorator';
import { AdminGuard } from '../admin/admin.guard';
import { UpdateRoleRbacDto } from './dto/update_role-rbac.dto';

@UseGuards(AdminGuard)
@Controller('roles')
export class RbacController {
    constructor(private readonly rbacService: RbacService) {}

    @Post()
    insertRole(@Body() role_types: InsertRoleRbacDto, @AdminDecorator() admin: string) {
        const admin_token: string[] = admin.split("Bearer ");
        return this.rbacService.insertRole(role_types, admin_token[1]);
    }

    @Get()
    getUserRoles(@AdminDecorator() admin: string) {
        const admin_token: string[] = admin.split("Bearer ");
        return this.rbacService.getUserRoles(admin_token[1]);
    }

    @Put()
    updateRoles(@Body() role_types: UpdateRoleRbacDto, @AdminDecorator() admin: string) {
        const admin_token: string[] = admin.split("Bearer ");
        return this.rbacService.updateRoeles(role_types, admin_token[1]);
    }
}
