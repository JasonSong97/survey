import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
     
     constructor(
          private readonly authService: AuthService,
          private readonly userService: UserService,
     ) {}
     
     async canActivate(context: ExecutionContext): Promise<boolean> {
          const req = context.switchToHttp().getRequest();
          const rawToken = req.headers['authorization'];
          if (!rawToken) throw new UnauthorizedException('토큰이 없습니다.');
          
          const token = this.authService.extractTokenFromHeader(rawToken, true); // 토큰만 추출
          const result = await this.authService.verifyToken(token) // 토큰 검증
          // result = token 내부에 Payload -> 사용자 정보 존재
          const user = await this.userService.getUserByEmail(result.email);
          req.user = user;
          req.token = token;
          req.tokenType = result.type;
          return true;
     }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
     
     async canActivate(context: ExecutionContext): Promise<boolean> {
          await super.canActivate(context);
          const req = context.switchToHttp().getRequest();
          if (req.tokenType !== 'access') throw new UnauthorizedException('Access Token이 없습니다.');
          return true;
     }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
     
     async canActivate(context: ExecutionContext): Promise<boolean> {
          await super.canActivate(context);
          const req = context.switchToHttp().getRequest();
          if (req.tokenType !== 'refresh') throw new UnauthorizedException('Refresh Token이 없습니다.');
          return true;
     }
}