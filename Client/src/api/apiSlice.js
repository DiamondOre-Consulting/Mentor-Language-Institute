import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    genericGet: builder.query({
      query: ({ url, params, headers, responseType }) => ({
        url,
        method: "GET",
        params,
        headers,
        responseType,
      }),
    }),
    genericPost: builder.mutation({
      query: ({ url, data, params, headers, responseType }) => ({
        url,
        method: "POST",
        data,
        params,
        headers,
        responseType,
      }),
    }),
    genericPut: builder.mutation({
      query: ({ url, data, params, headers, responseType }) => ({
        url,
        method: "PUT",
        data,
        params,
        headers,
        responseType,
      }),
    }),
    genericDelete: builder.mutation({
      query: ({ url, data, params, headers, responseType }) => ({
        url,
        method: "DELETE",
        data,
        params,
        headers,
        responseType,
      }),
    }),
  }),
});

export const {
  useGenericGetQuery,
  useLazyGenericGetQuery,
  useGenericPostMutation,
  useGenericPutMutation,
  useGenericDeleteMutation,
} = apiSlice;
