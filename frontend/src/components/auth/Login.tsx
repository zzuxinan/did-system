import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import axios from 'axios';

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    walletAddress: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setFormData(prev => ({
        ...prev,
        walletAddress: accounts[0]
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signChallenge = async (challenge: string): Promise<string> => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // 请求用户签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challenge, formData.walletAddress]
      });

      return signature;
    } catch (err: any) {
      throw new Error('Failed to sign challenge: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 第一步：发送邮箱密码登录请求
      const response = await axios.post('/api/login', {
        email: formData.email,
        password: formData.password
      });

      // 获取 challenge
      setChallenge(response.data.challenge);

      // 第二步：使用 MetaMask 签名 challenge
      const signature = await signChallenge(response.data.challenge);

      // 第三步：验证签名
      const verifyResponse = await axios.post('/api/verify-signature', {
        email: formData.email,
        password: formData.password,
        challenge: response.data.challenge,
        signature,
        wallet_address: formData.walletAddress
      });

      // 存储 token
      localStorage.setItem('token', verifyResponse.data.token);

      // 跳转到首页
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={connectWallet}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {formData.walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
          </div>

          {formData.walletAddress && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Connected Wallet:</p>
              <p className="text-sm font-mono">{formData.walletAddress}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !formData.walletAddress}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 