'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/lib/context/auth-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';

interface UserData {
  identity: {
    name: string;
    idNumber: string;
    phone: string;
    address: string;
  };
  profile: {
    education: string;
    workExperience: string;
    skills: string[];
  };
  credentials: {
    certificates: string[];
    licenses: string[];
  };
}

export default function ProfilePage() {
  const { token } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    identity: {
      name: '',
      idNumber: '',
      phone: '',
      address: ''
    },
    profile: {
      education: '',
      workExperience: '',
      skills: []
    },
    credentials: {
      certificates: [],
      licenses: []
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取用户数据
  const fetchUserData = async (dataType: keyof UserData) => {
    try {
      const response = await fetch(`http://localhost:5050/api/user-data/${dataType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.data?.data_content) {
        setUserData(prev => ({
          ...prev,
          [dataType]: data.data.data_content
        }));
      }
    } catch (err) {
      setError('获取数据失败');
    }
  };

  // 更新用户数据
  const updateUserData = async (dataType: keyof UserData) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5050/api/user-data/${dataType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data_content: userData[dataType]
        })
      });

      const data = await response.json();
      if (data.message) {
        setSuccess('更新成功');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('更新失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData('identity');
      fetchUserData('profile');
      fetchUserData('credentials');
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">个人信息管理</h1>
        <Link href="/authorize">
          <Button variant="outline">管理数据授权</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 身份信息 */}
      <Card>
        <CardHeader>
          <CardTitle>身份信息</CardTitle>
          <CardDescription>管理您的个人身份信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label>姓名</label>
                <Input
                  value={userData.identity.name}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    identity: { ...prev.identity, name: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>身份证号</label>
                <Input
                  value={userData.identity.idNumber}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    identity: { ...prev.identity, idNumber: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>手机号码</label>
                <Input
                  value={userData.identity.phone}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    identity: { ...prev.identity, phone: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>地址</label>
                <Input
                  value={userData.identity.address}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    identity: { ...prev.identity, address: e.target.value }
                  }))}
                />
              </div>
            </div>
            <Button onClick={() => updateUserData('identity')} disabled={loading}>
              {loading ? '保存中...' : '保存身份信息'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 个人资料 */}
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>管理您的个人资料信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label>教育经历</label>
                <Textarea
                  value={userData.profile.education}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, education: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>工作经历</label>
                <Textarea
                  value={userData.profile.workExperience}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, workExperience: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>技能（用逗号分隔）</label>
                <Input
                  value={userData.profile.skills.join(', ')}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, skills: e.target.value.split(',').map(s => s.trim()) }
                  }))}
                />
              </div>
            </div>
            <Button onClick={() => updateUserData('profile')} disabled={loading}>
              {loading ? '保存中...' : '保存个人资料'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 证书信息 */}
      <Card>
        <CardHeader>
          <CardTitle>证书信息</CardTitle>
          <CardDescription>管理您的证书和执照信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label>证书（用逗号分隔）</label>
                <Input
                  value={userData.credentials.certificates.join(', ')}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    credentials: { ...prev.credentials, certificates: e.target.value.split(',').map(s => s.trim()) }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label>执照（用逗号分隔）</label>
                <Input
                  value={userData.credentials.licenses.join(', ')}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    credentials: { ...prev.credentials, licenses: e.target.value.split(',').map(s => s.trim()) }
                  }))}
                />
              </div>
            </div>
            <Button onClick={() => updateUserData('credentials')} disabled={loading}>
              {loading ? '保存中...' : '保存证书信息'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 