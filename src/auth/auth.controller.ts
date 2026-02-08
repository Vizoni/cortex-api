import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { GoogleLoginRequest } from './dto/google-login-request.dto.js';
import { RefreshTokenRequest } from './dto/refresh-token-request.dto.js';
import { AuthResponse } from './dto/auth-response.dto.js';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/google/login')
  async loginWithGoogle(
    @Body() googleLoginRequest: GoogleLoginRequest,
  ): Promise<AuthResponse> {
    return this.authService.loginWithGoogle(googleLoginRequest.code);
  }

  @Post('/refresh')
  async refreshToken(
    @Body() refreshTokenRequest: RefreshTokenRequest,
  ): Promise<AuthResponse> {
    return this.authService.refreshAccessToken(
      refreshTokenRequest.refreshToken,
    );
  }

  @Post('/logout')
  async logout(@Body() refreshTokenRequest: RefreshTokenRequest) {
    await this.authService.revokeRefreshToken(refreshTokenRequest.refreshToken);
    return { message: 'Logout successful' };
  }
}
