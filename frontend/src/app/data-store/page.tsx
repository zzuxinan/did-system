'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DataStorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [encryptedHash, setEncryptedHash] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);

  const handleUpload = () => {
    if (!file) return;
    // TODO: 实现文件加密逻辑
    console.log('Upload file:', file);
    setEncryptedHash('0x1234...5678');
  };

  const handleDecrypt = () => {
    // TODO: 实现解密逻辑
    console.log('Decrypt data');
    setDecryptedData('解密后的数据内容');
    setIsDecrypted(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">数据存储与解密</h1>

      <Card>
        <CardHeader>
          <CardTitle>加密数据</CardTitle>
          <CardDescription>上传并加密您的数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>选择文件</label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleUpload}>上传并加密</Button>
          </div>
        </CardContent>
      </Card>

      {encryptedHash && (
        <Card>
          <CardHeader>
            <CardTitle>加密结果</CardTitle>
            <CardDescription>数据加密后的哈希值</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono break-all">{encryptedHash}</p>
              </div>
              <Button onClick={handleDecrypt}>解密数据</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isDecrypted && (
        <Card>
          <CardHeader>
            <CardTitle>解密结果</CardTitle>
            <CardDescription>使用私钥解密后的数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={decryptedData}
                readOnly
                className="min-h-[100px]"
              />
              <div className="flex justify-end space-x-4">
                <Button variant="outline">复制数据</Button>
                <Button variant="outline">下载文件</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 