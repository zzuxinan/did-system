'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import api from '@/lib/api/config';

export default function DataStorePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [fileHash, setFileHash] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [decryptHash, setDecryptHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/user-data/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFileHash(response.data.hash);
      setSuccess('文件上传并加密成功');
    } catch (e) {
      setError('文件上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptHash || !token) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/user-data/decrypt', {
        hash: decryptHash
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const fileContentBase64 = response.data.file_content;
      const filename = response.data.filename || 'decrypted_file';
      const byteCharacters = atob(fileContentBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('数据解密并下载成功');
    } catch (e) {
      setError('数据解密失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">数据存储与解密</h1>
          <Link href="/dashboard">
            <Button variant="outline">返回仪表盘</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 加密上传部分 */}
          <Card>
            <CardHeader>
              <CardTitle>加密数据</CardTitle>
              <CardDescription>上传并加密你的数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">选择文件</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="w-full"
                >
                  {loading ? '处理中...' : '上传并加密'}
                </Button>
                {fileHash && (
                  <div className="space-y-2">
                    <Label>加密串（用于解密和下载）</Label>
                    <div className="p-2 bg-gray-100 rounded-md break-all">
                      {fileHash}
                    </div>
                    <Button
                      onClick={() => navigator.clipboard.writeText(fileHash)}
                      variant="outline"
                      className="w-full"
                    >
                      复制加密串
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* 解密下载部分 */}
          <Card>
            <CardHeader>
              <CardTitle>解密数据</CardTitle>
              <CardDescription>输入加密串并解密</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hash">加密串</Label>
                  <Input
                    id="hash"
                    value={decryptHash}
                    onChange={(e) => setDecryptHash(e.target.value)}
                    placeholder="请输入加密串"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleDecrypt}
                  disabled={!decryptHash || loading}
                  className="w-full"
                >
                  {loading ? '处理中...' : '解密数据'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mt-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </ProtectedRoute>
  );
} 