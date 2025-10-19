import Fastify from 'fastify'
import jwt from '@fastify/jwt'
// import mongo from './plugins/mongo.js'
import { fpSqlitePlugin } from "fastify-sqlite-typed"
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import cors from '@fastify/cors'
import oltRoutes from './routes/olt.js'
import { readFileSync } from "fs"
import { join } from "path"

dotenv.config()
const fastify = Fastify({ logger: false })

await fastify.register(cors);
// Register SQLite
fastify.register(fpSqlitePlugin, {
  dbFilename: "./sqlite.db",
});

// Initialize database tables
async function initDatabase() {
  // Create users table
  await fastify.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create olt_data table
  await fastify.db.exec(`
    CREATE TABLE IF NOT EXISTS olt_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      router_ip TEXT NOT NULL,
      cluster TEXT NOT NULL,
      eth_trunk TEXT NOT NULL,
      name TEXT NOT NULL
    )
  `);
}

// Migrate data from JSON to database
async function migrateOltData() {
  try {
    // Check if data already exists
    const existingCount = await fastify.db.get('SELECT COUNT(*) as count FROM olt_data');
    
    if (existingCount.count === 0) {
      console.log('Migrating OLT data from JSON to database...');
      
      const oltDataPath = join(process.cwd(), "./utils/olt_data.json");
      const OLT_MAPPING = JSON.parse(readFileSync(oltDataPath, "utf-8"));
      
      for (const [ip, details] of Object.entries(OLT_MAPPING)) {
        const cluster = details.Cluster;
        for (const [eth_trunk, name] of Object.entries(details["Eth-Trunks"])) {
          if (name && name.trim() !== '') {
            await fastify.db.run(
              'INSERT INTO olt_data (router_ip, cluster, eth_trunk, name) VALUES (?, ?, ?, ?)',
              [ip, cluster, eth_trunk, name]
            );
          }
        }
      }
      
      console.log('OLT data migration completed successfully');
    }
  } catch (error) {
    console.error('Error migrating OLT data:', error);
  }
}

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
    // Wait for plugins to be ready
    await fastify.ready()
    
    // Initialize database tables
    await initDatabase()
    
    // Migrate OLT data from JSON to database
    await migrateOltData()
    
    const port = process.env.PORT
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
