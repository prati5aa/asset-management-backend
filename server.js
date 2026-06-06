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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());


app.use('/api/auth',         authRoutes);
app.use('/api/assets',       assetRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/transactions', transactionRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));