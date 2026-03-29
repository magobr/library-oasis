import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import * as crypto from "crypto";
import { AdminToken } from "src/admin/admin.decorator";
import { AdminGuard } from "src/admin/admin.guard";
import { AdminTokenDto } from "src/admin/dto/admin.dto";
import { CreatePatronDto, UpdatePatronDto } from "./dto/patron.dto";
import { PatronService } from "./patron.service";

@UseGuards(AdminGuard)
@Controller("patron")
export class PatronController {
  constructor(private readonly patronService: PatronService) {}

  @Post()
  async addPatron(
    @AdminToken() token: AdminTokenDto,
    @Body() patron: CreatePatronDto,
  ) {
    return await this.patronService.addPatron(token, patron);
  }

  @Get()
  async find(@AdminToken() token: AdminTokenDto) {
    return await this.patronService.find(token);
  }

  @Get("book/:bookId")
  async findByBookId(
    @AdminToken() token: AdminTokenDto,
    @Param("bookId") bookId: crypto.UUID,
  ) {
    return await this.patronService.findByBookId(token, bookId);
  }

  @Get("user/:userId")
  async findByUserId(
    @AdminToken() token: AdminTokenDto,
    @Param("userId") userId: crypto.UUID,
  ) {
    return await this.patronService.findByUserId(token, userId);
  }

  @Put(":patronId")
  async updatePatron(
    @AdminToken() token: AdminTokenDto,
    @Param("patronId") patronId: crypto.UUID,
    @Body() patron: UpdatePatronDto,
  ) {
    return await this.patronService.updateStatusPatron(token, patronId, patron);
  }
}
