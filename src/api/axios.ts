import axios from "axios";

const API_URL = "http://localhost:3000/api/v1"; // Replace with your actual backend URL

export const apiWithoutAuth = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach the access token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("access_token");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s and refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const { access_token } = response.data;

        sessionStorage.setItem("access_token", access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem("access_token");
        // window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
