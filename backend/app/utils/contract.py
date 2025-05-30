from web3 import Web3
import json
from pathlib import Path
import os

def get_web3():
    """获取 Web3 实例"""
    config_path = Path(__file__).parent.parent.parent / 'config' / 'ganache_accounts.json'
    with open(config_path) as f:
        config = json.load(f)
        rpc_url = config['rpc_url']
    
    return Web3(Web3.HTTPProvider(rpc_url))

def get_contract():
    """获取合约实例"""
    w3 = get_web3()
    
    # 读取合约 ABI
    contract_path = Path(__file__).parent.parent.parent / 'contracts' / 'DID.json'
    with open(contract_path) as f:
        contract_json = json.load(f)
        contract_abi = contract_json['abi']
        contract_address = contract_json['networks']['5777']['address']  # Ganache 网络 ID 为 5777
    
    return w3.eth.contract(address=contract_address, abi=contract_abi)

def deploy_contract():
    """部署合约到 Ganache"""
    w3 = get_web3()
    
    # 读取合约源码
    contract_path = Path(__file__).parent.parent.parent / 'contracts' / 'DID.sol'
    with open(contract_path) as f:
        contract_source = f.read()
    
    # 编译合约
    from solcx import compile_standard, install_solc
    install_solc('0.8.0')
    
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {
                "DID.sol": {
                    "content": contract_source
                }
            },
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                    }
                }
            }
        },
        solc_version="0.8.0"
    )
    
    # 获取字节码和 ABI
    bytecode = compiled_sol['contracts']['DID.sol']['DID']['evm']['bytecode']['object']
    abi = compiled_sol['contracts']['DID.sol']['DID']['abi']
    
    # 获取部署账户
    config_path = Path(__file__).parent.parent.parent / 'config' / 'ganache_accounts.json'
    with open(config_path) as f:
        config = json.load(f)
        deploy_account = config['accounts'][0]
    
    # 创建合约实例
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # 构建部署交易
    tx = contract.constructor().build_transaction({
        'from': deploy_account,
        'nonce': w3.eth.get_transaction_count(deploy_account),
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # 发送交易
    tx_hash = w3.eth.send_transaction(tx)
    
    # 等待交易确认
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # 保存合约信息
    contract_info = {
        'abi': abi,
        'networks': {
            '5777': {  # Ganache 网络 ID
                'address': tx_receipt.contractAddress
            }
        }
    }
    
    contract_json_path = Path(__file__).parent.parent.parent / 'contracts' / 'DID.json'
    with open(contract_json_path, 'w') as f:
        json.dump(contract_info, f, indent=2)
    
    return tx_receipt.contractAddress 