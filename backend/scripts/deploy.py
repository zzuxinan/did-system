from web3 import Web3
from eth_account import Account
import json
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 连接到以太坊网络
w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_RPC_URL')))

# 加载合约 ABI
with open('backend/contracts/DID.json', 'r') as f:
    contract_json = json.load(f)
    contract_abi = contract_json['abi']
    contract_bytecode = contract_json['bytecode']

def deploy_contract():
    # 获取部署账户
    account = Account.from_key(os.getenv('PRIVATE_KEY'))
    
    # 创建合约实例
    contract = w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)
    
    # 构建交易
    transaction = contract.constructor().build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # 签名交易
    signed_txn = w3.eth.account.sign_transaction(transaction, os.getenv('PRIVATE_KEY'))
    
    # 发送交易
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    # 等待交易确认
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # 获取合约地址
    contract_address = tx_receipt.contractAddress
    
    print(f'Contract deployed at: {contract_address}')
    
    # 保存合约地址
    with open('backend/contracts/contract_address.txt', 'w') as f:
        f.write(contract_address)
    
    return contract_address

if __name__ == '__main__':
    deploy_contract() 