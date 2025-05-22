'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VerifyPage() {
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleVerify = () => {
    // TODO: 实现验证逻辑
    setVerificationResult({
      isValid: true,
      message: '验证成功',
      details: {
        did: 'did:example:123456789',
        timestamp: '2024-03-20 10:00:00',
        signature: '0x1234...5678'
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">声明验证</h1>

      <Card>
        <CardHeader>
          <CardTitle>验证声明</CardTitle>
          <CardDescription>上传或扫描声明二维码进行验证</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>声明二维码</label>
              <div className="flex space-x-4">
                <Input
                  type="file"
                  accept="image/*"
                  className="flex-1"
                />
                <Button variant="outline">扫描</Button>
              </div>
            </div>
            <Button onClick={handleVerify}>开始验证</Button>
          </div>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>验证结果</CardTitle>
            <CardDescription>
              {verificationResult.isValid ? '验证成功' : '验证失败'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                verificationResult.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <p className="font-medium">{verificationResult.message}</p>
              </div>
              {verificationResult.details && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">详细信息：</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">DID：</span>{verificationResult.details.did}</p>
                    <p><span className="font-medium">时间戳：</span>{verificationResult.details.timestamp}</p>
                    <p><span className="font-medium">签名：</span>{verificationResult.details.signature}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 