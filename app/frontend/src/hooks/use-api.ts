import { useState, useCallback } from "react";
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseApiOptions {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

interface RequestConfig extends Omit<AxiosRequestConfig, 'baseURL' | 'headers' | 'timeout'> {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

const defaultOptions: UseApiOptions = {
  baseURL: "http://127.0.0.1:8001/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
};

export const useApi = (options: UseApiOptions = defaultOptions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: options.baseURL,
    headers: options.headers,
    timeout: options.timeout,
  });

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request error:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error:", error.message);
      }
      return Promise.reject(error);
    }
  );

  const fetchData = useCallback(
    async <T>(
      endpoint: string,
      method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
      body?: any,
      config: RequestConfig = {}
    ): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      
      try {
        const requestConfig: AxiosRequestConfig = {
          ...config,
          headers: {
            ...axiosInstance.defaults.headers,
            ...config.headers,
          },
        };

        let response: AxiosResponse;
        switch (method) {
          case "GET":
            response = await axiosInstance.get(endpoint, requestConfig);
            break;
          case "POST":
            response = await axiosInstance.post(endpoint, body, requestConfig);
            break;
          case "PUT":
            response = await axiosInstance.put(endpoint, body, requestConfig);
            break;
          case "DELETE":
            response = await axiosInstance.delete(endpoint, requestConfig);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        return {
          data: response.data,
          error: null,
          isLoading: false,
        };
      } catch (error) {
        return {
          data: null,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [axiosInstance]
  );

  const get = useCallback(
    <T>(endpoint: string, config?: RequestConfig) => {
      return fetchData<T>(endpoint, "GET", undefined, config);
    },
    [fetchData]
  );

  const post = useCallback(
    <T>(endpoint: string, body: any, config?: RequestConfig) => {
      return fetchData<T>(endpoint, "POST", body, config);
    },
    [fetchData]
  );

  const put = useCallback(
    <T>(endpoint: string, body: any, config?: RequestConfig) => {
      return fetchData<T>(endpoint, "PUT", body, config);
    },
    [fetchData]
  );

  const delete_ = useCallback(
    <T>(endpoint: string, config?: RequestConfig) => {
      return fetchData<T>(endpoint, "DELETE", undefined, config);
    },
    [fetchData]
  );

  return {
    isLoading,
    get,
    post,
    put,
    delete: delete_,
    axios: axiosInstance,
  };
};
