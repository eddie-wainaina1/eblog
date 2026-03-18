import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

// One-time setup: creates the admin account if none exists.
// Call POST /api/setup after deploying. Will refuse once an admin exists.
export async function POST() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment' },
      { status: 500 },
    )
  }

  await connectDB()

  const existing = await User.findOne({ role: 'admin' })
  if (existing) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 })
  }

  const user = await User.create({ email, password, role: 'admin' })
  return NextResponse.json({ ok: true, email: user.email }, { status: 201 })
}
