import Fastify from 'fastify'
import jwt from '@fastify/jwt'
// import mongo from './plugins/mongo.js'
import { fpSqlitePlugin } from "fastify-sqlite-typed"
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import cors from '@fastify/cors'
import oltRoutes from './routes/olt.js'

dotenv.config()
const fastify = Fastify({ logger: false })

await fastify.register(cors);
// Register SQLite
fastify.register(fpSqlitePlugin, {
  dbFilename: "./sqlite.db",
});

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
})

// Auth decorator
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ error: 'Invalid token' })
  }
})

// Register routes
fastify.register(authRoutes, { prefix: '/auth' })
fastify.register(oltRoutes, { prefix: '/olt' })

// Start server
const start = async () => {
  try {
    const port = process.env.PORT
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
