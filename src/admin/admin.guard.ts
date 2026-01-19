
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            if (typeof request.headers.authorization === 'undefined') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);        
            }

            const user_token = request.headers.authorization?.replace('Bearer ', '');
            console.log(user_token);
            if (!user_token) {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);        
            }

            await this.jwtService.verifyAsync(
                user_token,
                {
                    secret: process.env.SECRET_JWT
                }
            );
        } catch {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);        
        }
        return true;
  }
}
