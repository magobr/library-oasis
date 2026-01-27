import { Param, Controller, Body, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import * as crypto from 'crypto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminGuard } from './admin.guard';

// @UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get(':id')
    getAdmin(@Param('id') id: crypto.UUID) {
        return this.adminService.find(id);
    }

    @Post()
    createAdmin(@Body() new_admin: CreateAdminDto) {
        return this.adminService.create(new_admin);
    }
    
    @Put(':id')
    updateAdmin(@Param('id') id: crypto.UUID, @Body() updated_admin: UpdateAdminDto) {
        return this.adminService.update(id, updated_admin);
    }

    @Delete(':id')
    deleteAdmin(@Param('id') id: crypto.UUID) {
        return this.adminService.delete(id);
    }

    @Post('auth')
    authAdmin(@Body() auth_admin: { email: string; password: string }) {
        return this.adminService.authenticate(auth_admin);
    }
}