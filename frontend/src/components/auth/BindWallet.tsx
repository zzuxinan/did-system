import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const BindWallet: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    try {
      // 检查是否安装了 MetaMask
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // 请求用户连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setWalletAddress(accounts[0]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBindWallet = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 获取签名消息
      const message = 'Please sign this message to bind your wallet';
      
      // 请求用户签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });

      // 发送绑定请求
      const response = await axios.post('/api/bind-wallet', {
        wallet_address: walletAddress,
        signature
      });

      // 更新钱包绑定状态
      setWalletAddress(response.data.user.wallet_address);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Bind MetaMask Wallet</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Connected Wallet:</p>
            <p className="text-sm font-mono">{walletAddress}</p>
          </div>
          
          <button
            onClick={handleBindWallet}
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Binding...' : 'Bind Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BindWallet; 