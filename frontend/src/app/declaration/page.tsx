'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/lib/context/auth-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';

interface Declaration {
  id: number;
  content: string;
  signature: string;
  qr_code_path: string;
  created_at: string;
  expires_at: string | null;
}

export default function DeclarationPage() {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDeclaration = async () => {
    if (!content.trim()) {
      setError('请输入声明内容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5050/api/declarations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();
      if (data.declaration) {
        setDeclaration(data.declaration);
        setError('');
      }
    } catch (err) {
      setError('创建声明失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">声明签名</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>创建声明</CardTitle>
          <CardDescription>输入声明内容并生成签名</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>声明内容</label>
              <Textarea
                placeholder="请输入声明内容"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleCreateDeclaration} disabled={loading}>
              {loading ? '处理中...' : '生成签名'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {declaration && (
        <Card>
          <CardHeader>
            <CardTitle>声明详情</CardTitle>
            <CardDescription>声明签名和验证信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label>声明内容</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {declaration.content}
                </div>
              </div>
              <div className="space-y-2">
                <label>签名</label>
                <div className="p-4 bg-gray-50 rounded-lg font-mono break-all">
                  {declaration.signature}
                </div>
              </div>
              <div className="space-y-2">
                <label>二维码</label>
                <div className="p-4 bg-white rounded-lg border">
                  <Image
                    src={declaration.qr_code_path}
                    alt="声明二维码"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(declaration.signature);
                }}>
                  复制签名
                </Button>
                <Button variant="outline" onClick={() => {
                  window.open(declaration.qr_code_path);
                }}>
                  下载二维码
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 