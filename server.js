require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./config/db');

const authRoutes        = require('./routes/auth');
const assetRoutes       = require('./routes/assetsRoute');
const adminRoutes       = require('./routes/adminRoute');
const transactionRoutes = require('./routes/transactionRoute');

connectDB();

const app = express();



app.use(cors({
  origin: process.env.CLIENT_URL || 'https://asset-management-frontend-umber.vercel.app/',
  credentials: true,
}));

app.use(express.json());


app.use('/api/auth',         authRoutes);
app.use('/api/assets',       assetRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/transactions', transactionRoutes);

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`server running on port ${PORT}`));