'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/lib/context/auth-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Authorization {
  id: number;
  data_type: string;
  authorized_address: string;
  status: string;
  created_at: string;
  revoked_at: string | null;
  expires_at: string | null;
}

interface TimelineLog {
  id: number;
  action: string;
  timestamp: string;
}

const DURATION_OPTIONS = [
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
  { value: 180, label: '3小时' },
  { value: 360, label: '6小时' },
  { value: 720, label: '12小时' },
  { value: 1440, label: '24小时' }
];

export default function AuthorizePage() {
  const { token } = useAuth();
  const [dataType, setDataType] = useState('identity');
  const [authorizedAddress, setAuthorizedAddress] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [timeline, setTimeline] = useState<TimelineLog[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取授权列表
  const fetchAuthorizations = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/authorizations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.authorizations) {
        setAuthorizations(data.authorizations);
      }
    } catch (err) {
      setError('获取授权列表失败');
    }
  };

  // 获取授权时间线
  const fetchTimeline = async (authorizationId: number) => {
    try {
      const response = await fetch(`http://localhost:5050/api/authorizations/${authorizationId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.logs) {
        setTimeline(data.logs);
      }
    } catch (err) {
      setError('获取时间线失败');
    }
  };

  // 创建授权
  const handleAddAuthorization = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5050/api/authorizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data_type: dataType,
          authorized_address: authorizedAddress,
          duration_minutes: durationMinutes
        })
      });

      const data = await response.json();
      if (data.message) {
        setSuccess('授权创建成功');
        setAuthorizedAddress('');
        fetchAuthorizations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || '创建授权失败');
      }
    } catch (err) {
      setError('创建授权失败');
    } finally {
      setLoading(false);
    }
  };

  // 撤销授权
  const handleRevokeAuthorization = async (authId: number) => {
    try {
      const response = await fetch(`http://localhost:5050/api/authorizations/${authId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.message) {
        setSuccess('授权撤销成功');
        fetchAuthorizations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || '撤销授权失败');
      }
    } catch (err) {
      setError('撤销授权失败');
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuthorizations();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">数据授权管理</h1>
          <p className="text-muted-foreground">管理您的数据授权和访问权限</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/authorized-data">查看授权数据</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>创建新授权</CardTitle>
          <CardDescription>授权其他地址访问您的数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label>数据类型</label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identity">身份信息</SelectItem>
                    <SelectItem value="profile">个人资料</SelectItem>
                    <SelectItem value="credentials">证书信息</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>授权地址</label>
                <Input
                  value={authorizedAddress}
                  onChange={(e) => setAuthorizedAddress(e.target.value)}
                  placeholder="输入授权对象的钱包地址"
                />
              </div>
              <div className="space-y-2">
                <label>授权时长</label>
                <Select value={durationMinutes.toString()} onValueChange={(value) => setDurationMinutes(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择授权时长" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddAuthorization} disabled={loading}>
              {loading ? '创建中...' : '创建授权'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>授权列表</CardTitle>
          <CardDescription>查看和管理您的数据授权</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authorizations.map((auth) => (
              <div key={auth.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {auth.data_type === 'identity' ? '身份信息' :
                     auth.data_type === 'profile' ? '个人资料' : '证书信息'}
                  </div>
                  <div className="text-sm text-gray-500">
                    授权地址: {auth.authorized_address}
                  </div>
                  <div className="text-sm text-gray-500">
                    创建时间: {new Date(auth.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    过期时间: {auth.expires_at ? new Date(auth.expires_at).toLocaleString() : '永久'}
                  </div>
                  <div className="text-sm text-gray-500">
                    状态: {auth.status === 'active' ? '有效' : '已撤销'}
                  </div>
                </div>
                {auth.status === 'active' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleRevokeAuthorization(auth.id)}
                  >
                    撤销授权
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {timeline.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>授权时间线</CardTitle>
          <CardDescription>授权操作历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {timeline.map((log) => (
                <div key={log.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    log.action === 'created' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
              <div>
                    <p className="font-medium">
                      {log.action === 'created' ? '新增授权' : '撤销授权'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
              </div>
            </div>
              ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
} 