import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { API_ENDPOINTS } from '../config/api';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    is_wallet_bound: boolean;
    wallet_address: string | null;
  } | null;
  walletAddress: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    walletAddress: null
  });

  // 注册
  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAuthState({
        token: data.token,
        user: data.user,
        walletAddress: null
      });

      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAuthState({
        token: data.token,
        user: data.user,
        walletAddress: data.user.wallet_address
      });

      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAuthState(prev => ({
        ...prev,
        walletAddress: accounts[0]
      }));

      return accounts[0];
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 绑定钱包
  const bindWallet = async () => {
    try {
      if (!authState.token) {
        throw new Error('请先登录');
      }

      if (!authState.walletAddress) {
        throw new Error('请先连接钱包');
      }

      if (authState.user?.is_wallet_bound) {
        throw new Error('已绑定钱包');
      }

      const message = `绑定钱包地址: ${authState.walletAddress}`;
      const signature = await signMessage(message);

      const response = await fetch(API_ENDPOINTS.updateWallet, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          wallet_address: authState.walletAddress,
          signature,
          message
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user
      }));

      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 签名消息
  const signMessage = async (message: string) => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      return signature;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 获取授权数据
  const getAuthorizedData = async (dataType: string) => {
    try {
      if (!authState.token || !authState.walletAddress) {
        throw new Error('请先登录并连接钱包');
      }

      if (!authState.user?.is_wallet_bound) {
        throw new Error('请先绑定钱包');
      }

      if (authState.walletAddress.toLowerCase() !== authState.user.wallet_address?.toLowerCase()) {
        throw new Error('请使用绑定的钱包地址');
      }

      const message = `请求访问 ${dataType} 数据`;
      const signature = await signMessage(message);

      const response = await fetch(API_ENDPOINTS.authorizedData(dataType), {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'X-Wallet-Signature': signature,
          'X-Message': message,
          'X-Wallet-Address': authState.walletAddress
        }
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 授权数据访问
  const authorizeData = async (authorizedWallet: string, dataType: string, expiresIn: number = 30) => {
    try {
      if (!authState.token) {
        throw new Error('请先登录');
      }

      if (!authState.user?.is_wallet_bound) {
        throw new Error('请先绑定钱包');
      }

      if (authState.walletAddress?.toLowerCase() !== authState.user.wallet_address?.toLowerCase()) {
        throw new Error('请使用绑定的钱包地址');
      }

      const response = await fetch(API_ENDPOINTS.authorizations, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          authorized_wallet: authorizedWallet,
          data_type: dataType,
          expires_in: expiresIn
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 获取授权列表
  const getAuthorizations = async () => {
    try {
      if (!authState.token) {
        throw new Error('请先登录');
      }

      if (!authState.user?.is_wallet_bound) {
        throw new Error('请先绑定钱包');
      }

      if (authState.walletAddress?.toLowerCase() !== authState.user.wallet_address?.toLowerCase()) {
        throw new Error('请使用绑定的钱包地址');
      }

      const response = await fetch(API_ENDPOINTS.authorizations, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.authorizations;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 撤销授权
  const revokeAuthorization = async (authId: number) => {
    try {
      if (!authState.token) {
        throw new Error('请先登录');
      }

      if (!authState.user?.is_wallet_bound) {
        throw new Error('请先绑定钱包');
      }

      if (authState.walletAddress?.toLowerCase() !== authState.user.wallet_address?.toLowerCase()) {
        throw new Error('请使用绑定的钱包地址');
      }

      const response = await fetch(API_ENDPOINTS.revokeAuthorization(authId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message);
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
            setAuthState(prev => ({
              ...prev,
              walletAddress: accounts[0]
            }));
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
        setAuthState(prev => ({
          ...prev,
          walletAddress: accounts[0] || null
        }));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return {
    ...authState,
    register,
    login,
    connectWallet,
    bindWallet,
    signMessage,
    getAuthorizedData,
    authorizeData,
    getAuthorizations,
    revokeAuthorization
  };
} 