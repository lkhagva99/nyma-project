import bcrypt from "bcrypt";

export default async function authRoutes(fastify, options) {
  // Register new user
  fastify.post("/register", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password)
      return reply.code(400).send({ error: "Email and password required" });

    const existing = await fastify.db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing) return reply.code(400).send({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await fastify.db.run(
      "INSERT INTO users(email,password,created_at) VALUES(?,?,?)",
      [email, hashed, new Date()]
    );

    reply.code(201).send({ message: "User registered successfully" });
  });

  // Login
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password)
      return reply.code(400).send({ error: "Email and password required" });

    const user = await fastify.db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (!user) return reply.code(401).send({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.code(401).send({ error: "Invalid credentials" });

    const token = fastify.jwt.sign(
      { id: user._id, email: user.email },
      { expiresIn: "1h" }
    );

    reply.send({ token });
  });

  // Verify token - returns current user basic info if valid
  fastify.get(
    "/verify",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      // request.user is populated by jwtVerify()
      const { id, email } = request.user;
      return reply.send({ ok: true, user: { id, email } });
    }
  );
}
