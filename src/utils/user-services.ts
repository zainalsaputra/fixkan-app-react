import axios from 'axios';

export async function fetchUsers() {

    const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;

    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: {
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIwNzc3MzNkLWU3MjctNGNkNS04YTZjLTg4Zjk4ZjU5ZDdiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDMxMDU3MiwiZXhwIjoxNzQ0MzE0MTcyfQ.WVY4tSM6CXvmMM2ICv1wm3Z6kApRbpjA2WH5_UAMujA',
            },
        });

        // const data = response.data;

        // if (!Array.isArray(data)) {
        //     console.error('❌ fetchUsers: Expected array but got:', data);
        //     return [];
        // }

        // return data;

        if (!response.data || !Array.isArray(response.data.data)) {
            throw new Error(`❌ fetchUsers: Expected array but got: ${JSON.stringify(response.data)}`);
        }

        return response.data.data;
    } catch (error) {
        console.error('❌ fetchUsers error:', error);
        return [];
    }
}
