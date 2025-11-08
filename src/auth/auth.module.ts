import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubAuthService } from './github-auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('GITHUB_PRIVATE_KEY') || 'default-secret',
        signOptions: { 
          expiresIn: '10m',
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GitHubAuthService, JwtStrategy, JwtAuthGuard],
  exports: [GitHubAuthService, JwtAuthGuard],
})
export class AuthModule {}
