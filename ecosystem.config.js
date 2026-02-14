/**
 * PM2 ecosystem config for IsoFlux @ isoflux.app
 * Server: 198.211.109.46 (Digital Ocean)
 * Usage: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'isoflux',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      error_file: '/var/log/pm2/isoflux-error.log',
      out_file: '/var/log/pm2/isoflux-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
