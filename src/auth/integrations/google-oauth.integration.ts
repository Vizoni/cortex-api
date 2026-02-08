import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  GoogleTokenResponse,
  GoogleUserInfo,
} from '../interfaces/google-oauth.interface.js';

/**
 * Camada de integração com Google OAuth2
 * Responsável por toda comunicação com APIs externas do Google
 */
@Injectable()
export class GoogleOAuthIntegration {
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userInfoUrl =
    'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Troca o código de autorização por tokens do Google
   *
   * @param code - Código de autorização obtido do OAuth flow
   * @returns Tokens de acesso e refresh do Google
   * @throws Error se a troca falhar
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Configurações do Google OAuth não encontradas');
    }

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    try {
      const response = await firstValueFrom(
        this.httpService.post<GoogleTokenResponse>(
          this.tokenUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error('Falha ao obter tokens do Google');
    }
  }

  /**
   * Obtém informações do usuário autenticado no Google
   *
   * @param accessToken - Token de acesso do Google
   * @returns Informações do perfil do usuário
   * @throws Error se a busca falhar
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<GoogleUserInfo>(this.userInfoUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error('Falha ao obter informações do usuário');
    }
  }

  /**
   * Renova o access token usando refresh token
   *
   * @param refreshToken - Refresh token do Google
   * @returns Novos tokens
   * @throws Error se a renovação falhar
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Configurações do Google OAuth não encontradas');
    }

    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
      const response = await firstValueFrom(
        this.httpService.post<GoogleTokenResponse>(
          this.tokenUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error('Falha ao renovar token do Google');
    }
  }

  /**
   * Revoga o token do Google (logout)
   *
   * @param token - Access token ou refresh token para revogar
   * @throws Error se a revogação falhar
   */
  async revokeToken(token: string): Promise<void> {
    const revokeUrl = 'https://oauth2.googleapis.com/revoke';

    const params = new URLSearchParams();
    params.append('token', token);

    try {
      await firstValueFrom(
        this.httpService.post(revokeUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
    } catch (error) {
      throw new Error('Falha ao revogar token do Google');
    }
  }
}
