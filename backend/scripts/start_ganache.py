from web3 import Web3
import subprocess
import json
import os
import time
from pathlib import Path

def start_ganache():
    # 确保 ganache 已安装
    try:
        subprocess.run(['ganache', '--version'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("请先安装 ganache: npm install -g ganache")
        return None

    # 启动 ganache 并配置 10 个测试账户
    ganache_process = subprocess.Popen([
        'ganache',
        '--accounts', '10',
        '--defaultBalanceEther', '1000',
        '--port', '8545',
        '--chain.hardfork', 'shanghai'
    ])

    # 等待 ganache 启动
    time.sleep(2)

    # 连接到 ganache
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    
    if not w3.is_connected():
        print("无法连接到 Ganache")
        ganache_process.terminate()
        return None

    # 获取测试账户
    accounts = w3.eth.accounts
    
    # 保存账户信息到文件
    accounts_info = {
        'accounts': accounts,
        'rpc_url': 'http://127.0.0.1:8545'
    }
    
    config_dir = Path(__file__).parent.parent / 'config'
    config_dir.mkdir(exist_ok=True)
    
    with open(config_dir / 'ganache_accounts.json', 'w') as f:
        json.dump(accounts_info, f, indent=2)

    print(f"Ganache 已启动，创建了 {len(accounts)} 个测试账户")
    print(f"RPC URL: http://127.0.0.1:8545")
    
    return ganache_process

if __name__ == '__main__':
    start_ganache() 