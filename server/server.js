import 'dotenv/config'; // must stay the first import
import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

try {
  await connectDB(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`API running on port ${port}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}