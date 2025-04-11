import axiosInstance from './interceptor/axios-instances';

export async function login(email: string, password: string) {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;

  try {
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });

    const { accessToken, refreshToken, user } = response.data.response;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) return;

  try {
    await axiosInstance.post('/auth/logout', {
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.clear();
    window.location.href = '/sign-in';
  }
}
