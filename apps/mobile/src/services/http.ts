import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  create,
  InternalAxiosRequestConfig,
} from "axios";
import qs from "qs";

import { getApiBaseUrl } from "@/config/env";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function createPublicApiClient() {
  return create({
    baseURL: getApiBaseUrl(),
  });
}

export function createAuthenticatedApiClient(
  getAccessToken: () => Promise<string | null>,
  signOut: () => Promise<void>
): AxiosInstance {
  const client = create({
    baseURL: getApiBaseUrl(),
    paramsSerializer: (params) => qs.stringify(params),
  });

  client.interceptors.request.use(async (config: RetryableRequestConfig) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await getAccessToken();

        if (!newAccessToken) {
          await signOut();
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        await signOut();
        return Promise.reject(refreshError);
      }
    }
  );

  return client;
}
