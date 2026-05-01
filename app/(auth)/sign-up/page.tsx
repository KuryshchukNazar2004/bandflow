"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { register } from "@/app/actions/auth"
import { useActionState } from "react"

import { GoogleSignIn } from "@/components/auth/google-sign-in"

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(register, undefined)
  
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (state) {
      toast.error(state)
    }
  }, [state])

  return (
    <div className="max-w-md mx-auto w-full space-y-8 py-8 px-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-[#2D1B69]">Приєднатись</h1>
        <p className="text-muted-foreground text-lg">
          Вже є акаунт?{" "}
          <Link href="/sign-in" className="text-[#6C5CE7] hover:underline font-medium">
            Увійти
          </Link>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bandName" className="text-gray-700 font-medium">
            Назва гурту <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bandName"
            name="bandName"
            placeholder="Назва вашого гурту"
            required
            className="h-12 bg-white border-gray-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="password"className="text-gray-700 font-medium">
            Пароль <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              required
              minLength={8}
              className="h-12 bg-white border-gray-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full h-12 bg-[#2D1B69] hover:bg-[#1a0f40] text-white text-lg font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm transition-all hover:shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Реєстрація...
            </>
          ) : (
            "Зареєструватись"
          )}
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
