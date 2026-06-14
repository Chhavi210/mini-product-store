import { apiClient } from './client'
import type { AuthResponse, AuthUser, LoginCredentials } from '@/types'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', {
    ...credentials,
    expiresInMins: 30,
  })
  return data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me')
  return data
}
