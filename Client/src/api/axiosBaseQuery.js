import axiosInstance from "./axiosInstance";

export const axiosBaseQuery =
  ({ baseUrl } = {}) =>
  async ({ url, method, data, params, headers, responseType }) => {
    const normalizedUrl = /^https?:\/\//i.test(url || "")
      ? url
      : url?.startsWith("/")
      ? url.slice(1)
      : url;
    try {
      const result = await axiosInstance({
        url: baseUrl ? `${baseUrl}${normalizedUrl}` : normalizedUrl,
        method,
        data,
        params,
        headers,
        responseType,
      });
      return {
        data: {
          status: result.status,
          data: result.data,
          statusText: result.statusText,
        },
      };
    } catch (axiosError) {
      const err = axiosError;
      const status = err.response?.status;
      const data = err.response?.data || err.message;
      return {
        error: {
          status,
          data,
          response: status ? { status, data } : undefined,
          message: err.message,
        },
      };
    }
  };
