import {
  useLazyGenericGetQuery,
  useGenericPostMutation,
  useGenericPutMutation,
  useGenericDeleteMutation,
} from "./apiSlice";

export const useApi = () => {
  const [get] = useLazyGenericGetQuery();
  const [post] = useGenericPostMutation();
  const [put] = useGenericPutMutation();
  const [del] = useGenericDeleteMutation();

  return { get, post, put, del };
};
