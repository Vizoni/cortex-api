import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

export interface CreateUserData {
  email: string;
  name: string;
  picture?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca ou cria um usuário baseado nos dados do OAuth
   *
   * Como funciona:
   * 1. Tenta buscar usuário pelo providerId (ex: Google ID)
   * 2. Se não encontrar, cria novo usuário
   * 3. Retorna o usuário (existente ou novo)
   *
   * @param data - Dados do usuário vindos do OAuth
   * @returns Usuário do banco de dados
   */
  async findOrCreate(data: CreateUserData): Promise<User> {
    // 1. Primeiro, tenta encontrar usuário existente pelo provider ID
    let user = await this.prisma.user.findUnique({
      where: { providerId: data.providerId },
    });

    console.info('\n\n');
    console.info('USER foi encontrado?', user);
    console.info('\n\n');

    // 2. Se encontrou, retorna ele (pode ter endereço, telefone, etc)
    if (user) {
      return user;
    }

    // 3. Não encontrou? Verifica se existe pelo email
    // (usuário pode ter usado outro provider antes)
    user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // 4. Se encontrou pelo email, atualiza o provider ID
    if (user) {
      console.info('\n\n');
      console.info('VAI atualizar USUARIO');
      console.info('\n\n');
      return this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: data.providerId,
          provider: data.provider,
          picture: data.picture || user.picture,
          name: data.name,
        },
      });
    }

    // 5. Não existe de jeito nenhum? Cria novo usuário!
    console.info('\n\n');
    console.info('VAI CRIAR USUARIO');
    console.info('\n\n');
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        picture: data.picture,
        provider: data.provider,
        providerId: data.providerId,
      },
    });
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
