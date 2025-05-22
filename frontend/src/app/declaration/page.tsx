'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function DeclarationPage() {
  const [declaration, setDeclaration] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  const handleGenerate = () => {
    // TODO: 实现生成声明逻辑
    console.log('Generate declaration:', declaration);
    // 模拟生成二维码
    setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    setIsSigned(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">声明签名</h1>

      <Card>
        <CardHeader>
          <CardTitle>创建声明</CardTitle>
          <CardDescription>输入声明内容并生成签名二维码</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>声明内容</label>
              <Textarea
                placeholder="例如：我已年满18岁"
                value={declaration}
                onChange={(e) => setDeclaration(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleGenerate}>生成声明</Button>
          </div>
        </CardContent>
      </Card>

      {isSigned && (
        <Card>
          <CardHeader>
            <CardTitle>签名二维码</CardTitle>
            <CardDescription>扫描二维码验证声明</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={qrCode} alt="声明二维码" className="w-64 h-64" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">声明内容：</p>
                <p className="font-medium">{declaration}</p>
              </div>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">下载二维码</Button>
                <Button variant="outline">复制验证链接</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 