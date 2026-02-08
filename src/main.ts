import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  const allowedOrigins = [
    'http://localhost:5173', // Frontend dev
    'https://cortex-one-hazel.vercel.app', // Frontend prod
  ];

  console.log('[INIT] Configurando CORS...');
  console.log('[CORS] Origens permitidas:', allowedOrigins);
  console.log('[ENV] NODE_ENV:', process.env.NODE_ENV);
  console.log('[ENV] PORT:', process.env.PORT);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      console.log('[CORS] Request de origem:', origin || 'SEM ORIGIN');
      
      // Permite requests sem origin (mobile apps, Postman, etc)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        console.log('[CORS] ✅ Origem permitida');
        callback(null, true);
      } else {
        console.log('[CORS] ❌ Origem bloqueada:', origin);
        callback(new Error(`Origin ${origin} não permitida por CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT ?? 3008;
  
  // IMPORTANTE: bind em 0.0.0.0 para aceitar conexões externas (Railway)
  await app.listen(port, '0.0.0.0');
  
  console.log('\n=================================');
  console.log(`🚀 Aplicação iniciada com sucesso!`);
  console.log(`📡 Escutando em: 0.0.0.0:${port}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================\n');
}
bootstrap();
