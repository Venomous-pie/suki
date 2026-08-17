import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log('Ensure you expose this via localtunnel for internet access!');
});
