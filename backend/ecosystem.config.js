module.exports = {
  apps: [
    {
      name: "cluster-config-backend",
      script: "./server.js",
      env: {
        PORT: 3001,
        JWT_SECRET: "supersecretkey",
        NODE: 22,
      },
    },
  ],
};
