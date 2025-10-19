module.exports = {
  apps: [
    {
      name: "python-backend",
      script: "python3",
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
