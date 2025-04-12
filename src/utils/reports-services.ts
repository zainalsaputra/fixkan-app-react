import axiosInstance from './interceptor/axios-instances';

export async function fetchReports() {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.warn('❌ Token not found in localStorage!');
    return [];
  }

  try {

    const response = await axiosInstance.get(`${BASE_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const reports = response.data?.data || [];

    console.log(reports);
    return reports;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
}
