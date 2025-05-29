import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface AuthState {
  token: string | null;
  user: any | null;
  walletAddress: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    walletAddress: null
  });

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

      const message = `请求访问 ${dataType} 数据`;
      const signature = await signMessage(message);

      const response = await fetch(`http://localhost:5050/api/authorized-data/${dataType}`, {
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

      const response = await fetch('http://localhost:5050/api/authorize', {
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

      const response = await fetch('http://localhost:5050/api/authorizations', {
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

      const response = await fetch(`http://localhost:5050/api/authorizations/${authId}`, {
        method: 'DELETE',
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
    connectWallet,
    signMessage,
    getAuthorizedData,
    authorizeData,
    getAuthorizations,
    revokeAuthorization
  };
} 