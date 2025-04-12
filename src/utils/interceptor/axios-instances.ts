import axios from 'axios';

const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/sign-in';
          return Promise.reject(error);
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = res.data.response;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('redirectAfterLogin', window.location.pathname);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Refresh token failed', err);

        localStorage.clear();
        window.location.href = '/sign-in';
      }
    }

    if (error.response?.status === 403) {
      window.location.href = '/sign-in';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
