import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { email, password } = await request.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 })
    }

    // If you want to return user data, make sure to exclude sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      // Add any other non-sensitive fields you want to return
    }

    return NextResponse.json({ message: 'Sign in successful', user: userData }, { status: 200 })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json({ message: 'Error during sign in' }, { status: 500 })
  }
}