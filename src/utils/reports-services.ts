import axiosInstance from './interceptor/axios-instances';

export async function fetchReports(route: string = '/') {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.warn('❌ Token not found in localStorage!');
    return [];
  }

  try {

    const response = await axiosInstance.get(`${BASE_URL}/reports${route}`, {
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


export async function deleteReport(route: string = '/') {
  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.warn('❌ Token not found in localStorage!');
    return null;
  }

  try {
    const response = await axiosInstance.get(`${BASE_URL}/reports${route}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete report:', error);
    throw error;
  }
}
