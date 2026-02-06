import React, { useEffect, useMemo, useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Receipt, Plus, Wallet, UserCog, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { clearTokens } from "@/lib/auth"

type UserMe = {
  _id: string
  firstname: string
  lastname: string
  username: string
  email: string
  imageUrl?: string
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Categories", href: "/categories", icon: Plus },
  { title: "Profile", href: "/profile", icon: UserCog },
]

// ✅ Use this for images (server base, not /api base)
const SERVER_BASE =
  (import.meta.env.VITE_SERVER_URL as string) ||
  (import.meta.env.VITE_API_URL as string) // fallback

function normalizeImageUrl(url?: string) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  const base = (SERVER_BASE || "").replace(/\/$/, "")
  const p = url.startsWith("/") ? url : `/${url}`
  return `${base}${p}`
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [me, setMe] = useState<UserMe | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)

  // ✅ Fetch profile for avatar + name
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoadingMe(true)
        const data = await apiFetch<UserMe>("/users/get-profile", { method: "GET" })
        if (!mounted) return
        setMe(data)
      } catch {
        // optional: if token invalid, force logout
        // clearTokens()
        // navigate("/login", { replace: true })
      } finally {
        if (mounted) setLoadingMe(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const displayName = useMemo(() => {
    if (!me) return "Account"
    const full = `${me.firstname ?? ""} ${me.lastname ?? ""}`.trim()
    return full || me.username || "Account"
  }, [me])

  const avatarSrc = useMemo(() => normalizeImageUrl(me?.imageUrl), [me?.imageUrl])

  function handleLogout() {
    clearTokens()
    navigate("/login", { replace: true })
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wallet className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            ExpenseTracker
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-400 text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer (✅ Profile + Logout) */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full overflow-hidden border border-sidebar-border bg-sidebar-accent flex items-center justify-center">
              {loadingMe ? (
                <div className="h-5 w-5 rounded-full bg-sidebar-border/60" />
              ) : avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-sidebar-muted">No</span>
              )}
            </div>

            {/* Name + email */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-sidebar-muted truncate">
                {me?.email ?? ""}
              </p>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 w-9 rounded-lg hover:bg-sidebar-accent flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-sidebar-muted" />
            </button>
          </div>

          <p className="text-xs text-sidebar-muted">Track your expenses wisely</p>
        </div>
      </div>
    </aside>
  )
}
