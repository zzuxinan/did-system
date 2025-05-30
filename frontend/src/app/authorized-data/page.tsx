'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/context/auth-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ethers } from 'ethers';
import api from '@/lib/api/config';

interface AuthorizedData {
  identity?: {
    name: string;
    idNumber: string;
    phone: string;
    address: string;
  };
  profile?: {
    education: string;
    workExperience: string;
    skills: string[];
  };
  credentials?: {
    certificates: string[];
    licenses: string[];
  };
}

export default function AuthorizedDataPage() {
  const { token } = useAuth();
  const [authorizedData, setAuthorizedData] = useState<AuthorizedData>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setWalletAddress(accounts[0]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 获取授权数据
  const fetchAuthorizedData = async (dataType: keyof AuthorizedData) => {
    if (!walletAddress) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/authorized-data/${dataType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else if (response.data.data_content) {
        setAuthorizedData(prev => ({
          ...prev,
          [dataType]: response.data.data_content
        }));
      }
    } catch (err) {
      setError('获取授权数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error('检查钱包连接失败:', err);
        }
      }
    };

    checkWalletConnection();

    // 监听钱包账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setWalletAddress(accounts[0] || '');
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">授权数据</h1>
          <p className="text-muted-foreground">
            查看您被授权访问的数据
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={connectWallet} variant="outline">
            {walletAddress ? '已连接钱包' : '连接钱包'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/authorize">
              管理数据授权
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {walletAddress && (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">当前连接钱包：</p>
          <p className="text-sm font-mono">{walletAddress}</p>
        </div>
      )}

      {/* 身份信息 */}
      <Card>
        <CardHeader>
          <CardTitle>身份信息</CardTitle>
          <CardDescription>查看授权访问的身份信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => fetchAuthorizedData('identity')} 
              disabled={loading || !walletAddress}
            >
              {loading ? '加载中...' : '查看身份信息'}
            </Button>
            {authorizedData.identity && (
              <div className="space-y-2">
                <div className="grid gap-2">
                  <div>
                    <span className="font-medium">姓名：</span>
                    {authorizedData.identity.name}
                  </div>
                  <div>
                    <span className="font-medium">身份证号：</span>
                    {authorizedData.identity.idNumber}
                  </div>
                  <div>
                    <span className="font-medium">手机号码：</span>
                    {authorizedData.identity.phone}
                  </div>
                  <div>
                    <span className="font-medium">地址：</span>
                    {authorizedData.identity.address}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 个人资料 */}
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>查看授权访问的个人资料</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => fetchAuthorizedData('profile')} 
              disabled={loading || !walletAddress}
            >
              {loading ? '加载中...' : '查看个人资料'}
            </Button>
            {authorizedData.profile && (
              <div className="space-y-2">
                <div className="grid gap-2">
                  <div>
                    <span className="font-medium">教育经历：</span>
                    {authorizedData.profile.education}
                  </div>
                  <div>
                    <span className="font-medium">工作经历：</span>
                    {authorizedData.profile.workExperience}
                  </div>
                  <div>
                    <span className="font-medium">技能：</span>
                    {authorizedData.profile.skills.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 证书信息 */}
      <Card>
        <CardHeader>
          <CardTitle>证书信息</CardTitle>
          <CardDescription>查看授权访问的证书信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => fetchAuthorizedData('credentials')} 
              disabled={loading || !walletAddress}
            >
              {loading ? '加载中...' : '查看证书信息'}
            </Button>
            {authorizedData.credentials && (
              <div className="space-y-2">
                <div className="grid gap-2">
                  <div>
                    <span className="font-medium">证书：</span>
                    {authorizedData.credentials.certificates.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">执照：</span>
                    {authorizedData.credentials.licenses.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 