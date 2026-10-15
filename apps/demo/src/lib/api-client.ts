import { toast } from "react-toastify";
import { env } from "@/config/env";
import axios from "axios";

// Request functions unwrap `response.data` themselves rather than through an
// interceptor: useInfiniteCursor takes this instance and reads `.data` too.
export const api = axios.create({ baseURL: env.API_URL });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message;
    toast.error(message);
    return Promise.reject(error);
  }
);
