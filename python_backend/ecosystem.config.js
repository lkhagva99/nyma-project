module.exports = {
  apps: [
    {
      name: "python-backend",
      script: "python",
      args: "app.py",
      interpreter: "none",
      env: {
        PORT: 3001,
        JWT_SECRET: "supersecretkey",
        PYTHONPATH: ".",
      },
    },
  ],
};
