// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DID is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _authorizationIds;

    // 用户信息结构
    struct User {
        string email;           // 用户邮箱
        bool isActive;          // 用户状态
        uint256 createdAt;      // 创建时间
    }

    // 授权信息结构
    struct Authorization {
        address owner;          // 数据所有者
        address authorized;     // 被授权者
        string dataType;        // 数据类型
        uint256 expiresAt;      // 过期时间
        bool isActive;          // 授权状态
    }

    // 事件
    event UserRegistered(address indexed wallet, string email);
    event WalletBound(address indexed wallet, string email);
    event AuthorizationCreated(uint256 indexed authId, address indexed owner, address indexed authorized, string dataType);
    event AuthorizationRevoked(uint256 indexed authId);
    event AuthorizationExpired(uint256 indexed authId);

    // 状态变量
    mapping(address => User) public users;                      // 钱包地址 => 用户信息
    mapping(string => address) public emailToWallet;            // 邮箱 => 钱包地址
    mapping(uint256 => Authorization) public authorizations;    // 授权ID => 授权信息
    mapping(address => uint256[]) public userAuthorizations;    // 用户 => 授权ID列表

    // 修饰器
    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "User not registered");
        _;
    }

    // 注册用户
    function register(string memory _email) external {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(emailToWallet[_email] == address(0), "Email already registered");
        require(users[msg.sender].isActive == false, "Wallet already registered");

        users[msg.sender] = User({
            email: _email,
            isActive: true,
            createdAt: block.timestamp
        });

        emailToWallet[_email] = msg.sender;

        emit UserRegistered(msg.sender, _email);
    }

    // 绑定钱包
    function bindWallet(string memory _email) external {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(emailToWallet[_email] == address(0), "Email already bound to a wallet");
        require(users[msg.sender].isActive == false, "Wallet already registered");

        users[msg.sender] = User({
            email: _email,
            isActive: true,
            createdAt: block.timestamp
        });

        emailToWallet[_email] = msg.sender;

        emit WalletBound(msg.sender, _email);
    }

    // 创建授权
    function createAuthorization(
        address _authorized,
        string memory _dataType,
        uint256 _expiresIn
    ) external onlyRegistered {
        require(_authorized != address(0), "Invalid authorized address");
        require(bytes(_dataType).length > 0, "Data type cannot be empty");
        require(_expiresIn > 0, "Expiration time must be greater than 0");

        _authorizationIds.increment();
        uint256 authId = _authorizationIds.current();

        authorizations[authId] = Authorization({
            owner: msg.sender,
            authorized: _authorized,
            dataType: _dataType,
            expiresAt: block.timestamp + _expiresIn,
            isActive: true
        });

        userAuthorizations[msg.sender].push(authId);

        emit AuthorizationCreated(authId, msg.sender, _authorized, _dataType);
    }

    // 撤销授权
    function revokeAuthorization(uint256 _authId) external {
        Authorization storage auth = authorizations[_authId];
        require(auth.owner == msg.sender, "Not the authorization owner");
        require(auth.isActive, "Authorization already revoked");

        auth.isActive = false;

        emit AuthorizationRevoked(_authId);
    }

    // 检查授权
    function checkAuthorization(
        address _owner,
        address _authorized,
        string memory _dataType
    ) external view returns (bool) {
        uint256[] storage authIds = userAuthorizations[_owner];
        
        for (uint256 i = 0; i < authIds.length; i++) {
            Authorization storage auth = authorizations[authIds[i]];
            if (
                auth.isActive &&
                auth.authorized == _authorized &&
                keccak256(bytes(auth.dataType)) == keccak256(bytes(_dataType)) &&
                auth.expiresAt > block.timestamp
            ) {
                return true;
            }
        }
        
        return false;
    }

    // 获取用户授权列表
    function getUserAuthorizations() external view returns (uint256[] memory) {
        return userAuthorizations[msg.sender];
    }

    // 获取授权详情
    function getAuthorization(uint256 _authId) external view returns (
        address owner,
        address authorized,
        string memory dataType,
        uint256 expiresAt,
        bool isActive
    ) {
        Authorization storage auth = authorizations[_authId];
        return (
            auth.owner,
            auth.authorized,
            auth.dataType,
            auth.expiresAt,
            auth.isActive
        );
    }

    // 检查用户是否已注册
    function isRegistered(address _wallet) external view returns (bool) {
        return users[_wallet].isActive;
    }

    // 获取用户邮箱
    function getUserEmail(address _wallet) external view returns (string memory) {
        require(users[_wallet].isActive, "User not registered");
        return users[_wallet].email;
    }

    // 获取钱包地址
    function getWalletAddress(string memory _email) external view returns (address) {
        return emailToWallet[_email];
    }
} 