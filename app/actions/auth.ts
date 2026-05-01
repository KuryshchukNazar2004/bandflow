"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  bandName: z.string().min(2),
})

export async function register(prevState: string | undefined, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return "Invalid fields"
  }

  const { email, password, bandName } = validatedFields.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return "Email already exists"
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: bandName,
      },
    })

    // Create Band record linked to user
    await prisma.band.create({
      data: {
        name: bandName,
        slug: bandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
        genre: "Не вказано",
        city: "Не вказано",
        price: 0,
        userId: user.id,
      }
    })

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
    
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}

export async function login(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}
