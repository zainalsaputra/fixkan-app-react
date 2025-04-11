import axiosInstance from './interceptor/axios-instances';

export async function fetchUsers() {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.warn('❌ Token not found in localStorage!');
    return [];
  }

  try {
    const response = await axiosInstance.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error(`❌ fetchUsers: Expected array but got: ${JSON.stringify(response.data)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('❌ fetchUsers error:', error);
    return [];
  }
}
