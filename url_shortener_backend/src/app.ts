import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

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
app.use(
  express.json({
    limit: '16kb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes Imports
import authRoutes from './routes/auth.route.js';

// Routes
app.use('/api/auth', authRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
