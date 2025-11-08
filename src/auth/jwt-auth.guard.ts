import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Allow webhook endpoints without authentication
    if (request.url?.includes('/webhooks/')) {
      return true;
    }
    
    // Allow health check endpoints
    if (request.url === '/health' || request.url === '/') {
      return true;
    }
    
    return super.canActivate(context);
  }
}
