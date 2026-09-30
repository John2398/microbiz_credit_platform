module.exports = {
  apps: [
    {
      name: "microbiz-credit-platform",
      script: "dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0"
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      }
    }
  ]
};
