from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()

class ContractManager:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_RPC_URL')))
        
        # 加载合约 ABI
        with open('backend/contracts/DID.json', 'r') as f:
            contract_json = json.load(f)
            self.contract_abi = contract_json['abi']
        
        # 加载合约地址
        with open('backend/contracts/contract_address.txt', 'r') as f:
            self.contract_address = f.read().strip()
        
        # 创建合约实例
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
    
    def register_user(self, wallet_address, email):
        """注册用户"""
        tx_hash = self.contract.functions.register(email).transact({
            'from': wallet_address
        })
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
    
    def bind_wallet(self, wallet_address, email):
        """绑定钱包"""
        tx_hash = self.contract.functions.bindWallet(email).transact({
            'from': wallet_address
        })
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
    
    def create_authorization(self, owner_address, authorized_address, data_type, expires_in):
        """创建授权"""
        tx_hash = self.contract.functions.createAuthorization(
            authorized_address,
            data_type,
            expires_in
        ).transact({
            'from': owner_address
        })
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
    
    def revoke_authorization(self, owner_address, auth_id):
        """撤销授权"""
        tx_hash = self.contract.functions.revokeAuthorization(auth_id).transact({
            'from': owner_address
        })
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
    
    def check_authorization(self, owner_address, authorized_address, data_type):
        """检查授权"""
        return self.contract.functions.checkAuthorization(
            owner_address,
            authorized_address,
            data_type
        ).call()
    
    def get_user_authorizations(self, wallet_address):
        """获取用户授权列表"""
        return self.contract.functions.getUserAuthorizations().call({
            'from': wallet_address
        })
    
    def get_authorization(self, auth_id):
        """获取授权详情"""
        return self.contract.functions.getAuthorization(auth_id).call()
    
    def is_registered(self, wallet_address):
        """检查用户是否已注册"""
        return self.contract.functions.isRegistered(wallet_address).call()
    
    def get_user_email(self, wallet_address):
        """获取用户邮箱"""
        return self.contract.functions.getUserEmail(wallet_address).call()
    
    def get_wallet_address(self, email):
        """获取钱包地址"""
        return self.contract.functions.getWalletAddress(email).call() 