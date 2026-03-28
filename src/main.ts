import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Habilitar CORS para que el SCADA pueda hacer fetch
  app.enableCors();


  // ✅ Escuchar en el puerto 3001 para no chocar con el frontend (3000)
  await app.listen(3001, '0.0.0.0');
}

bootstrap();

