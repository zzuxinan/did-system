'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import api from '@/lib/api/config';

function formatToBeijingTime(isoString: string) {
  let fixed = isoString.endsWith('Z') ? isoString : isoString + 'Z';
  const date = new Date(fixed);
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/profile/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.logs) {
          setLogs(response.data.logs);
        } else {
          setError(response.data.error || '获取操作记录失败');
        }
      } catch (e) {
        console.error('获取操作记录失败:', e);
        setError('获取操作记录失败');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

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
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3}>加载中...</TableCell></TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatToBeijingTime(log.created_at)}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.status === 'success' ? '成功' : '失败'}</TableCell>
                </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={3}>暂无操作记录</TableCell></TableRow>
                )}
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