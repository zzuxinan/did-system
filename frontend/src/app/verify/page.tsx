'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '@/lib/api/config';

interface VerificationResult {
  isValid: boolean;
  message: string;
  details?: {
    content: string;
    did: string;
    signature: string;
    timestamp: string;
  };
}

export default function VerifyPage() {
  const [signature, setSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!signature.trim()) {
      setError('请输入声明签名');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/declarations/${signature}/verify`);
      setVerificationResult(response.data);
      setError('');
    } catch (err) {
      setError('验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">声明验证</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>验证声明</CardTitle>
          <CardDescription>输入声明签名进行验证</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>声明签名</label>
                <Input
                placeholder="输入声明签名"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
            <Button onClick={handleVerify} disabled={loading}>
              {loading ? '验证中...' : '开始验证'}
            </Button>
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
              {verificationResult.details && (
                <>
                  <div className="space-y-2">
                    <label>声明内容</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {verificationResult.details.content}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label>DID</label>
                    <div className="p-4 bg-gray-50 rounded-lg font-mono break-all">
                      {verificationResult.details.did}
                    </div>
                  </div>
                <div className="space-y-2">
                    <label>签名</label>
                    <div className="p-4 bg-gray-50 rounded-lg font-mono break-all">
                      {verificationResult.details.signature}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label>时间戳</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {new Date(verificationResult.details.timestamp).toLocaleString()}
                  </div>
                </div>
                </>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(verificationResult.details?.signature || '');
                }}>
                  复制签名
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 