'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContractPage() {
  const [contractVersion, setContractVersion] = useState('');
  const [testMethod, setTestMethod] = useState('');
  const [testParams, setTestParams] = useState('');

  const handleDeploy = () => {
    // TODO: 实现合约部署逻辑
    console.log('Deploy contract:', { version: contractVersion });
  };

  const handleTest = () => {
    // TODO: 实现合约测试逻辑
    console.log('Test contract:', { method: testMethod, params: testParams });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">合约管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>合约信息</CardTitle>
          <CardDescription>当前部署的合约状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">合约地址</p>
              <p className="font-mono text-sm">0x1234...5678</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">当前版本</p>
              <p>v1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">合约状态</p>
              <p className="text-green-600">活跃</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deploy">
        <TabsList>
          <TabsTrigger value="deploy">部署合约</TabsTrigger>
          <TabsTrigger value="test">测试合约</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle>部署新版本</CardTitle>
              <CardDescription>部署新版本的智能合约</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>合约版本</label>
                  <Input
                    placeholder="例如：v1.0.1"
                    value={contractVersion}
                    onChange={(e) => setContractVersion(e.target.value)}
                  />
                </div>
                <Button onClick={handleDeploy}>部署合约</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>测试合约</CardTitle>
              <CardDescription>测试智能合约方法</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>测试方法</label>
                  <Select value={testMethod} onValueChange={setTestMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择方法" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="register">register</SelectItem>
                      <SelectItem value="authorize">authorize</SelectItem>
                      <SelectItem value="verify">verify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>参数（JSON格式）</label>
                  <Input
                    placeholder='{"param1": "value1"}'
                    value={testParams}
                    onChange={(e) => setTestParams(e.target.value)}
                  />
                </div>
                <Button onClick={handleTest}>执行测试</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>部署历史</CardTitle>
          <CardDescription>合约版本更新记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">v1.0.0</p>
                <p className="text-sm text-gray-500">2024-03-20 10:00:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">v1.0.1</p>
                <p className="text-sm text-gray-500">2024-03-20 11:00:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 