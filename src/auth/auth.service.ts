/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponse } from './dto/auth-response.dto.js';
import { GoogleOAuthIntegration } from './integrations/google-oauth.integration.js';

/**
 * Serviço de autenticação
 * Orquestra a lógica de negócio de autenticação
 * Não faz chamadas diretas a APIs externas ou banco de dados
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly googleOAuthIntegration: GoogleOAuthIntegration,
  ) {}

  /**
   * Processa o login via Google OAuth2
   *
   * @param code - Código de autorização do Google
   * @returns Resposta com tokens e dados do usuário
   */
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    try {
      // 1. Trocar o código por tokens do Google (via integration layer)
      const googleTokens =
        await this.googleOAuthIntegration.exchangeCodeForTokens(code);

      // 2. Obter informações do usuário do Google (via integration layer)
      const googleUser = await this.googleOAuthIntegration.getUserInfo(
        googleTokens.access_token,
      );

      // 3. TODO: Verificar/criar usuário no banco de dados
      // const user = await this.userRepository.findOrCreate(googleUser);

      // 4. TODO: Gerar tokens JWT próprios
      // const { accessToken, refreshToken } = await this.jwtService.generateTokens(user);

      // Por enquanto, retornamos os tokens do Google diretamente
      return {
        accessToken: googleTokens.access_token,
        refreshToken: googleTokens.refresh_token || 'mock_refresh_token',
        expiresIn: googleTokens.expires_in,
        user: {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
      };
    } catch (error) {
      console.error('[AuthService] Erro no login com Google:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new UnauthorizedException(
        `Falha ao autenticar com Google: ${errorMessage}`,
      );
    }
  }

  async refreshAccessToken(_refreshToken: string): Promise<AuthResponse> {
    // TODO: Validar refresh token
    // TODO: Verificar se não está revogado no banco
    // TODO: Gerar novos tokens JWT

    // Mock response para estrutura inicial
    return Promise.resolve({
      accessToken: 'new_mock_access_token',
      refreshToken: 'new_mock_refresh_token',
      expiresIn: 3600,
      user: {
        id: 'user_id',
        email: 'user@example.com',
        name: 'User Name',
        picture: 'https://example.com/picture.jpg',
      },
    });
  }

  async validateToken(_token: string): Promise<any> {
    // TODO: Validar JWT token
    // TODO: Verificar se o usuário ainda existe no banco
    // TODO: Retornar dados do usuário

    return Promise.resolve(null);
  }

  async revokeRefreshToken(_refreshToken: string): Promise<void> {
    // TODO: Marcar token como revogado no banco de dados
    return Promise.resolve();
  }
}
