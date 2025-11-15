import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { name, email, password } = await request.json()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    })

    await newUser.save()

    return NextResponse.json({ message: 'User created. Please check your email for verification.YES!!' }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 })
  }
}