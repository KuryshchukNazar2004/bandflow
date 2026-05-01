"use client"

import { useActionState, useEffect, useState } from "react"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { GoogleSignIn } from "@/components/auth/google-sign-in"

export default function SignInPage() {
  const [state, action, isPending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state) {
      toast.error(state)
    }
  }, [state])

  return (
    <div className="w-full space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-[#2D1B69]">Увійти</h1>
        <p className="text-muted-foreground text-lg">
          Ще не маєте акаунту?{" "}
          <Link href="/sign-up" className="text-[#6C5CE7] hover:underline font-medium">
            Зареєструватись
          </Link>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="your@email.com" 
            required 
            className="h-12 bg-white border-gray-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7]" 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link href="#" className="text-sm text-[#6C5CE7] hover:underline">
              Забули пароль?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="h-12 bg-white border-gray-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full h-12 bg-[#2D1B69] hover:bg-[#1a0f40] text-white text-lg font-medium rounded-lg mt-4 shadow-sm transition-all hover:shadow-md"
        >
          {isPending ? <Loader2 className="animate-spin" /> : "Увійти"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#FDFCFB] px-2 text-muted-foreground">
            АБО
          </span>
        </div>
      </div>

      <GoogleSignIn />
    </div>
  )
}
