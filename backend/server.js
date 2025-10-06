import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import mongo from './plugins/mongo.js'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import cors from '@fastify/cors'

dotenv.config()
const fastify = Fastify({ logger: false })

await fastify.register(cors);
// Register MongoDB
fastify.register(mongo)

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

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
