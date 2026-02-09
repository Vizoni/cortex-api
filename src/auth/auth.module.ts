import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleOAuthIntegration } from './integrations/google-oauth.integration.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [HttpModule, ConfigModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleOAuthIntegration],
  exports: [AuthService],
})
export class AuthModule {}
