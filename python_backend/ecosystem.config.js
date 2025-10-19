module.exports = {
  apps: [
    {
      name: "python-backend",
      script: "python3",
      args: "app.py",
      interpreter: "none",
      env: {
        PORT: 3001,
        HOST: "0.0.0.0",
        JWT_SECRET: "supersecretkey",
        PYTHONPATH: ".",
      },
      cwd: "./python_backend",
    },
  ],
};
