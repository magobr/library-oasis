import { Param, Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import * as crypto from 'crypto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get(':id')
    getHello(@Param('id') id: crypto.UUID) {
        return this.adminService.find(id);
    }
}
