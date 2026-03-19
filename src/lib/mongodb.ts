import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null }
global.mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,  // give up selecting a server after 5 s
        connectTimeoutMS: 5000,          // give up on the TCP connection after 5 s
        socketTimeoutMS: 10000,          // close idle sockets after 10 s
      })
      .then((m) => m)
      .catch((err) => {
        // Don't cache a failed connection — let the next request retry
        cached.promise = null
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
