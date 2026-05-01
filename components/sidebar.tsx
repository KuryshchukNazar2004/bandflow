"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  User,
  Users,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
  BarChart3,
  ExternalLink,
  LogOut,
  Settings,
  Eye,
  Music,
  ChevronRight
} from "lucide-react"
import { signOut } from "next-auth/react"
import { User as NextAuthUser } from "next-auth"

const routes = [
  { label: "Огляд", icon: LayoutDashboard, href: "/dashboard", color: "text-violet-600" },
  { label: "Календар", icon: Calendar, href: "/dashboard/calendar", color: "text-violet-600" },
  { label: "Бронювання", icon: ListChecks, href: "/dashboard/bookings", color: "text-violet-600" },
  { label: "Профіль гурту", icon: Settings, href: "/dashboard/profile", color: "text-violet-600" },
  { label: "Фото галерея", icon: ImageIcon, href: "/dashboard/gallery", color: "text-violet-600" },
  { label: "Ціни та послуги", icon: DollarSign, href: "/dashboard/pricing", color: "text-violet-600" },
  { label: "Аналітика", icon: BarChart3, href: "/dashboard/analytics", color: "text-violet-600" },
]

interface SidebarProps {
  bandSlug?: string;
  user?: NextAuthUser;
}

export function Sidebar({ bandSlug, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E4E1DC] text-[#4A4A57]">
      <div className="px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D1B69] flex items-center justify-center text-white">
            <Music size={18} />
          </div>
          <h1 className="text-xl font-medium font-serif text-[#2D1B69]">BandFlow</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-colors duration-200",
                  isActive 
                    ? "text-[#2D1B69] font-bold" 
                    : "text-[#6B6B7E] hover:text-[#2D1B69] hover:bg-gray-50"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", isActive ? "text-[#2D1B69]" : "text-[#6B6B7E] group-hover:text-[#2D1B69]")} strokeWidth={isActive ? 2.5 : 2} />
                  {route.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="mt-auto px-6 py-6 border-t border-[#E4E1DC]">
        <div className="space-y-1 mb-6">
          {bandSlug && (
            <Link href={`/bands/${bandSlug}`} target="_blank" className="flex items-center p-3 text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors rounded-lg hover:bg-[#7C3AED]/5">
               <Eye className="h-5 w-5 mr-3" />
               Публічна сторінка
            </Link>
          )}

          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center p-3 text-sm font-medium text-[#6B6B7E] hover:text-[#EF4444] transition-colors rounded-lg hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Вийти
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Music size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#1A1A1A] truncate">
              {user?.name || "BandFlow User"}
            </span>
            <span className="text-xs text-[#6B6B7E] truncate">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
