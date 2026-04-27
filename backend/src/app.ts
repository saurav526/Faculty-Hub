import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import facultyRoutes from './routes/faculty';
import statusRoutes from './routes/status';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/status', statusRoutes);

app.use(errorHandler);

export default app;
