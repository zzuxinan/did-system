'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthorizePage() {
  const [dataType, setDataType] = useState('');
  const [authorizedAddress, setAuthorizedAddress] = useState('');

  const handleAddAuthorization = () => {
    // TODO: 实现添加授权逻辑
    console.log('Add authorization:', { dataType, authorizedAddress });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">数据授权管理</h1>
        <Button>新增授权</Button>
      </div>

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
            <Button onClick={handleAddAuthorization}>确认授权</Button>
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
              <TableRow>
                <TableCell>0x1234...5678</TableCell>
                <TableCell>身份信息</TableCell>
                <TableCell>2024-03-20 10:00:00</TableCell>
                <TableCell>有效</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">撤销</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>授权时间线</CardTitle>
          <CardDescription>授权操作历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">新增授权</p>
                <p className="text-sm text-gray-500">2024-03-20 10:00:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">授权生效</p>
                <p className="text-sm text-gray-500">2024-03-20 10:01:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 