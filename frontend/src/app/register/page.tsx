'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useMetaMask } from '@/lib/hooks/use-metamask';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const { register } = useAuth();
  const { account, isConnecting, error: walletError, connectWallet } = useMetaMask();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!account) {
      setError('请先连接 MetaMask 钱包');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">注册新账户</CardTitle>
          <CardDescription className="text-center">
            或者{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              登录已有账户
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {walletError && (
              <Alert variant="destructive">
                <AlertDescription>{walletError}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              {!account ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? '连接中...' : '连接 MetaMask 钱包'}
                </Button>
              ) : (
                <Alert>
                  <AlertDescription>
                    已连接钱包: {account.slice(0, 6)}...{account.slice(-4)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="电子邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !account}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 