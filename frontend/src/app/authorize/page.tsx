'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/lib/context/auth-context';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Authorization {
  id: number;
  data_type: string;
  authorized_address: string;
  status: string;
  created_at: string;
  revoked_at?: string;
}

interface TimelineLog {
  id: number;
  action: string;
  timestamp: string;
}

export default function AuthorizePage() {
  const { token } = useAuth();
  const [dataType, setDataType] = useState('');
  const [authorizedAddress, setAuthorizedAddress] = useState('');
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [timeline, setTimeline] = useState<TimelineLog[]>([]);
  const [error, setError] = useState('');
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
    if (!dataType || !authorizedAddress) {
      setError('请填写完整信息');
      return;
    }

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
          authorized_address: authorizedAddress
        })
      });

      const data = await response.json();
      if (data.authorization) {
        await fetchAuthorizations();
        setDataType('');
        setAuthorizedAddress('');
        setError('');
      }
    } catch (err) {
      setError('创建授权失败');
    } finally {
      setLoading(false);
    }
  };

  // 撤销授权
  const handleRevokeAuthorization = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5050/api/authorizations/${id}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.authorization) {
        await fetchAuthorizations();
        await fetchTimeline(id);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">数据授权管理</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>新增授权</CardTitle>
          <CardDescription>选择数据类型和授权对象</CardDescription>
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
                <label>授权对象地址</label>
                <Input
                  placeholder="输入授权对象的区块链地址"
                  value={authorizedAddress}
                  onChange={(e) => setAuthorizedAddress(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddAuthorization} disabled={loading}>
              {loading ? '处理中...' : '确认授权'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>授权记录</CardTitle>
          <CardDescription>查看您的数据授权历史</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>授权对象</TableHead>
                <TableHead>数据类型</TableHead>
                <TableHead>授权时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorizations.map((auth) => (
                <TableRow key={auth.id}>
                  <TableCell>{auth.authorized_address}</TableCell>
                  <TableCell>{auth.data_type}</TableCell>
                  <TableCell>{new Date(auth.created_at).toLocaleString()}</TableCell>
                  <TableCell>{auth.status}</TableCell>
                  <TableCell>
                    {auth.status === 'active' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeAuthorization(auth.id)}
                      >
                        撤销
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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