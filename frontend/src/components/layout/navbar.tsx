'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { name: '首页', href: '/' },
    { name: '数据授权', href: '/authorize', requiresAuth: true },
    { name: '声明签名', href: '/declaration', requiresAuth: true },
    { name: '验证入口', href: '/verify', requiresAuth: true },
    { name: '数据存储', href: '/data-store', requiresAuth: true },
    { name: '审计日志', href: '/audit', requiresAuth: true },
    { name: '合约管理', href: '/contract', requiresAuth: true },
  ];

  const handleNavClick = (href: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      router.push('/login');
      return;
    }
    router.push(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-screen-xl mx-auto flex h-16 items-center px-4 md:px-8">
        {/* Logo/Title */}
        <Link href="/" className="font-bold text-lg whitespace-nowrap mr-6 hidden sm:block">
          BCID-System
        </Link>
        {/* 导航项横向滚动，防止溢出 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.requiresAuth && !user) {
                    e.preventDefault();
                    router.push('/login');
                  }
                }}
                className={cn(
                  "text-sm font-medium px-2 py-1 rounded transition-colors hover:bg-gray-100 hover:text-primary whitespace-nowrap",
                  pathname === item.href
                    ? "text-primary bg-gray-100"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        {/* 右侧按钮区域，始终靠右 */}
        <div className="flex items-center space-x-2 ml-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">个人中心</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 