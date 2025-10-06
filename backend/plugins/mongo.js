import fp from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'

export default fp(async (fastify) => {
  try {
    await fastify.register(fastifyMongo, {
      url: process.env.MONGO_URI_SRV,
      forceClose: true, // closes on server stop
    })
    fastify.log.info('✅ MongoDB connected')
  } catch (err) {
    console.log(err)
    fastify.log.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
})