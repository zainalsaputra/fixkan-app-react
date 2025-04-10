import axios from 'axios';

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    email,
    password,
  });

  return response.data;
};
