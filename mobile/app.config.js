const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const loadEnv = (envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
};

loadEnv(path.resolve(__dirname, '../backend/.env'));
loadEnv(path.resolve(__dirname, '../frontend/.env'));
loadEnv(path.resolve(__dirname, '.env'));

const apiUrl = process.env.API_URL || process.env.VITE_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api';

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    apiUrl,
  },
});