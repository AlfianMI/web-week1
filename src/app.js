const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const loggerMiddleware = require('./middlewares/logger');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

const productRoutes = require('./routes/productRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Security and Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Routes Registration
app.use('/health', healthRoutes);
app.use('/api/v1/products', productRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
