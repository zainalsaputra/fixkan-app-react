import axios from 'axios';

export const login = async (email: string, password: string) => {

  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;

  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password,
  });

  return response.data;
};
