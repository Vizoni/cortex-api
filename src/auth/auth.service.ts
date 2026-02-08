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

      // Por enquanto, retornamos os tokens do Google diretamente com expiração de 60 segundos
      return {
        accessToken: googleTokens.access_token,
        refreshToken: googleTokens.refresh_token || 'mock_refresh_token',
        expiresIn: 60, // 60 segundos para testar expiração e refresh
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

  /**
   * Renova o access token usando refresh token do Google
   *
   * @param refreshToken - Refresh token do Google
   * @returns Nova resposta com tokens atualizados
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // 1. Renova o access token via Google OAuth (via integration layer)
      const googleTokens =
        await this.googleOAuthIntegration.refreshAccessToken(refreshToken);

      // 2. Busca informações do usuário com o novo token
      const googleUser = await this.googleOAuthIntegration.getUserInfo(
        googleTokens.access_token,
      );

      // 3. TODO: Buscar usuário do banco de dados
      // const user = await this.userRepository.findById(googleUser.id);

      // 4. TODO: Gerar novos tokens JWT próprios
      // const { accessToken, refreshToken } = await this.jwtService.generateTokens(user);

      // Por enquanto, retorna os tokens do Google com expiração de 60 segundos
      return {
        accessToken: googleTokens.access_token,
        refreshToken: googleTokens.refresh_token || refreshToken, // Google mantém o mesmo refresh token
        expiresIn: 60, // 60 segundos para testar expiração
        user: {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
      };
    } catch (error) {
      console.error('[AuthService] Erro ao renovar token:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new UnauthorizedException(
        `Falha ao renovar token: ${errorMessage}`,
      );
    }
  }

  async validateToken(_token: string): Promise<any> {
    // TODO: Validar JWT token
    // TODO: Verificar se o usuário ainda existe no banco
    // TODO: Retornar dados do usuário

    return Promise.resolve(null);
  }

  /**
   * Revoga um refresh token (logout)
   *
   * @param refreshToken - Token a ser revogado
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      // Revoga o token no Google (via integration layer)
      await this.googleOAuthIntegration.revokeToken(refreshToken);

      // TODO: Marcar token como revogado no banco de dados
      // await this.tokenRepository.revoke(refreshToken);
    } catch (error) {
      console.error('[AuthService] Erro ao revogar token:', error);
      // Não lança erro para não bloquear logout
    }
  }
}
