import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export const AdminToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    const authHeader = request.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded: JwtService = new JwtService().decode(token);

    return decoded;
  },
);
