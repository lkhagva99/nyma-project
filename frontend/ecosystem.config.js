// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "cluster-config-frontend",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Define environment variables
      },
    },
  ],
};