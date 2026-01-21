import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { RbacService } from './rbac.service';
import { InsertRoleRbacDto } from './dto/insert_role-rbac.dto';
import { AdminDecorator } from 'src/admin/admin.decorator';
import { AdminGuard } from 'src/admin/admin.guard';

@UseGuards(AdminGuard)
@Controller('roles')
export class RbacController {
    constructor(private readonly rbacService: RbacService) {}

    @Post()
    insertRole(@Body() role_types: InsertRoleRbacDto, @AdminDecorator() admin: string) {
        const admin_id: string[] = admin.split("Bearer ",);
        console.log(admin_id);
        return this.rbacService.insetRole(role_types, admin_id[1]);
    }
}
