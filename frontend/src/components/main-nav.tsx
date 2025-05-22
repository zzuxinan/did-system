import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
        )}
      >
        控制台
      </Link>
      <Link
        href="/profile"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/profile" ? "text-primary" : "text-muted-foreground"
        )}
      >
        个人中心
      </Link>
      <Link
        href="/authorize"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/authorize" ? "text-primary" : "text-muted-foreground"
        )}
      >
        数据授权
      </Link>
      <Link
        href="/authorized-data"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/authorized-data" ? "text-primary" : "text-muted-foreground"
        )}
      >
        授权数据
      </Link>
    </nav>
  )
} 