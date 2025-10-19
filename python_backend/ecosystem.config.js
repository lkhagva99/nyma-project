module.exports = {
  apps: [
    {
      name: "python-backend",
      script: "app.py",
      interpreter: "/usr/bin/python3",
      env: {
        PORT: 3001,
        HOST: "0.0.0.0",
        JWT_SECRET: "supersecretkey",
        PYTHONPATH: ".",
      },
      cwd: "./",
    },
  ],
};
