const express = require('express');
const webhookRoutes = express.Router();

module.exports = () => {
  webhookRoutes.post('/', (req, re, next) => {});
};
