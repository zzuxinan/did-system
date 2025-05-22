'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">审计与日志</h1>
        <div className="flex space-x-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择用户" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有用户</SelectItem>
              <SelectItem value="user1">用户1</SelectItem>
              <SelectItem value="user2">用户2</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有操作</SelectItem>
              <SelectItem value="login">登录</SelectItem>
              <SelectItem value="register">注册</SelectItem>
              <SelectItem value="authorize">授权</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-[180px]"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>访问日志</CardTitle>
          <CardDescription>用户访问系统记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>操作类型</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2024-03-20 10:00:00</TableCell>
                <TableCell>user1</TableCell>
                <TableCell>登录</TableCell>
                <TableCell>192.168.1.1</TableCell>
                <TableCell>成功</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-03-20 10:01:00</TableCell>
                <TableCell>user2</TableCell>
                <TableCell>注册</TableCell>
                <TableCell>192.168.1.2</TableCell>
                <TableCell>成功</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>合约调用记录</CardTitle>
          <CardDescription>智能合约交互记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">当前合约地址</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm">0x1234...5678</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">合约版本</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>v1.0.0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">合约状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600">活跃</p>
                </CardContent>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>交易哈希</TableHead>
                  <TableHead>调用方法</TableHead>
                  <TableHead>调用者</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">0xabcd...1234</TableCell>
                  <TableCell>register</TableCell>
                  <TableCell>0x1234...5678</TableCell>
                  <TableCell>2024-03-20 10:00:00</TableCell>
                  <TableCell>成功</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">0xefgh...5678</TableCell>
                  <TableCell>authorize</TableCell>
                  <TableCell>0x1234...5678</TableCell>
                  <TableCell>2024-03-20 10:01:00</TableCell>
                  <TableCell>成功</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 