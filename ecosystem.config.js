module.exports = {
  apps: [{
    name: 'nanofront',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    watch: ['public'], // Watch the public directory for changes
    ignore_watch: ['node_modules'],
    env: {
      NODE_ENV: 'production',
    }
  }]
};