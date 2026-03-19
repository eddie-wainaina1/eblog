export async function register() {
  // Only run in Node.js runtime (not edge), and only on the server
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('[setup] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed')
    return
  }

  try {
    const { connectDB } = await import('@/lib/mongodb')
    const { default: User } = await import('@/models/User')

    await connectDB()

    const exists = await User.findOne({ role: 'admin' })
    if (exists) return

    await User.create({ email, password, role: 'admin' })
    console.log(`[setup] Admin account created: ${email}`)
  } catch (err) {
    console.error('[setup] Failed to create admin account:', err)
  }
}
