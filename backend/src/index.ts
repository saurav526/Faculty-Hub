import app from './app';
import { config } from './config';
import { prisma } from './db';

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(config.port, () => {
    console.log(`Faculty Hub API running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
