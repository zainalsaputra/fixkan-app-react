import axios from 'axios';

export async function login(email: string, password: string) {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
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
