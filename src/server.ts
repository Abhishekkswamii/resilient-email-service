import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Important for Render

app.listen(PORT, HOST, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
