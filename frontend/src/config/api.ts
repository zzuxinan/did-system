export const API_BASE_URL = 'http://localhost:5002/api/v1/auth';

export const API_ENDPOINTS = {
  // 认证相关
  register: `${API_BASE_URL}/register`,
  login: `${API_BASE_URL}/login`,
  profile: `${API_BASE_URL}/profile`,
  updateProfile: `${API_BASE_URL}/profile`,
  changePassword: `${API_BASE_URL}/profile/password`,
  updateWallet: `${API_BASE_URL}/profile/wallet`,
  userLogs: `${API_BASE_URL}/profile/logs`,

  // 数据相关
  userData: (dataType: string) => `${API_BASE_URL}/user-data/${dataType}`,
  authorizedData: (dataType: string) => `${API_BASE_URL}/authorized-data/${dataType}`,
  
  // 授权相关
  authorizations: `${API_BASE_URL}/authorizations`,
  revokeAuthorization: (authId: number) => `${API_BASE_URL}/authorizations/${authId}/revoke`,
  authorizationTimeline: (authId: number) => `${API_BASE_URL}/authorizations/${authId}/timeline`,
  
  // 声明相关
  declarations: `${API_BASE_URL}/declarations`,
  verifyDeclaration: (signature: string) => `${API_BASE_URL}/declarations/${signature}/verify`,
  declarationQR: (signature: string) => `${API_BASE_URL}/declarations/${signature}/qr`,
}; 