import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Allow webhook endpoints without authentication
    if (request.url?.includes('/webhooks/')) {
      return true;
    }
    
    // Allow public endpoints
    if (request.url === '/health' || request.url === '/' || request.url === '/info') {
      return true;
    }
    
    // Allow metrics endpoint for Prometheus scraping
    if (request.url === '/metrics') {
      return true;
    }
    
    return super.canActivate(context);
  }
}
