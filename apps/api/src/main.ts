import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import dataSource from './config/data-source';

async function bootstrap() {
  const logger = new NestLogger('Bootstrap');

  try {
    logger.log('🚀 Starting application bootstrap...');

    // Run migrations before starting the app
    if (!dataSource.isInitialized) {
      logger.log('📦 Initializing database connection...');
      await dataSource.initialize();
      logger.log('✅ Database connection initialized');
    }

    logger.log('🔄 Running database migrations...');
    try {
      const hasPendingMigrations = await dataSource.showMigrations();
      if (hasPendingMigrations) {
        logger.log('Found pending migrations, executing...');
        const executedMigrations = await dataSource.runMigrations();
        if (executedMigrations.length > 0) {
          logger.log(`✅ Executed ${executedMigrations.length} migration(s):`);
          executedMigrations.forEach((migration) => {
            logger.log(`   - ${migration.name}`);
          });
        } else {
          logger.log('✅ No migrations to execute');
        }
      } else {
        logger.log('✅ Database is up to date (no pending migrations)');
      }
    } catch (migrationError) {
      logger.error('❌ Error running migrations:', migrationError);
      throw migrationError;
    }

    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    logger.log('✅ App module created successfully');

    // Configure WebSocket adapter for Socket.IO
    app.useWebSocketAdapter(new IoAdapter(app));
    logger.log('✅ WebSocket adapter configured');

    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      }),
    );

    app.use(cookieParser());

    const corsOrigin = process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN;
    const allowedOrigins = corsOrigin
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Token-Body'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('MINC Teams API')
      .setDescription('API para gerenciamento do Time Boas-Vindas - Minha Igreja na Cidade')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    app.setGlobalPrefix('minc-teams/v1');

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('minc-teams/v1/docs', app, document);

    // Get pino logger instance after app is configured
    const pinoLogger = app.get(Logger);
    app.useLogger(pinoLogger);

    logger.log('✅ Middleware and configuration applied');

    const port = process.env.PORT ?? 3001;
    logger.log(`🌐 Starting server on port ${port}...`);

    try {
      await app.listen(port);
      pinoLogger.log(`🚀 Application is running on: http://localhost:${port}`);
      pinoLogger.log(`📚 Swagger documentation: http://localhost:${port}/minc-teams/v1/docs`);
    } catch (listenError) {
      logger.error('❌ Error listening on port:', listenError);
      if (listenError instanceof Error) {
        if (listenError.message.includes('EADDRINUSE')) {
          logger.error(`❌ Port ${port} is already in use. Please use a different port.`);
        }
        logger.error('Error details:', listenError.message);
        logger.error('Error stack:', listenError.stack);
      }
      throw listenError;
    }
  } catch (error) {
    logger.error('❌ Error starting application:', error);
    if (error instanceof Error) {
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  const logger = new NestLogger('Bootstrap');
  logger.error('❌ Fatal error during bootstrap:', error);
  process.exit(1);
});
