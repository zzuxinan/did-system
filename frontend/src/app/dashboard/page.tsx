'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">个人中心</h1>
          <p className="text-muted-foreground">
            欢迎回来，{user?.name}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>个人信息管理</CardTitle>
              <CardDescription>管理您的身份信息、个人资料和证书信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push('/profile')}
                >
                  进入个人信息管理
                </Button>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">姓名</dt>
                    <dd>{user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">邮箱</dt>
                    <dd>{user?.email}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>常用功能入口</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild>
                  <Link href="/authorize">数据授权</Link>
                </Button>
                <Button asChild>
                  <Link href="/authorized-data">授权数据</Link>
                </Button>
                <Button asChild>
                  <Link href="/declaration">声明签名</Link>
                </Button>
                <Button asChild>
                  <Link href="/verify">验证入口</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>最近操作</CardTitle>
            <CardDescription>您的最近操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024-03-20 10:00</TableCell>
                  <TableCell>登录系统</TableCell>
                  <TableCell>成功</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>数据授权管理</CardTitle>
              <CardDescription>
                管理您的数据授权和访问权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/authorize')}>
                进入管理
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>授权数据访问</CardTitle>
              <CardDescription>
                查看您被授权访问的数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/authorized-data')}>
                查看数据
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 