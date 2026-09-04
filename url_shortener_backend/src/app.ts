import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// import compression from 'compression';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // enable in prod
  })
);
app.use(
  express.json({
    limit: '16kb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
});

// Routes Imports
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import urlRoutes from './routes/url.route.js';
import adminRoutes from './routes/admin.routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/admin', adminRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
