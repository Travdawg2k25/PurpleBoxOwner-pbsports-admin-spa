import axios from "axios";
import { toast } from "react-toastify";
import Auth from "../auth/Auth";

// Base URL: defaults to /api (nginx proxies /api -> FastAPI in prod;
// Vite dev server proxies /api -> http://localhost:8000 in dev).
export const baseURL = import.meta.env.VITE_API_BASE || "/api";

const apiInstance = axios.create({ baseURL });

// Attach bearer token on every request.
apiInstance.interceptors.request.use(
  (config) => {
    const token = Auth.token();
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize responses and handle auth errors. FastAPI errors are {detail}.
apiInstance.interceptors.response.use(
  (response) => ({ data: response.data, status: response.status }),
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    if (status === 401) {
      Auth.logout();
      toast.error("Session expired. Please log in again.");
      // BASE_URL is '/admin/' in the subpath build, '/' in dev — stay within the app.
      if (window.location.hash !== "#/") {
        window.location.href = `${import.meta.env.BASE_URL}#/`;
      }
    } else if (!error?.config?.disableToast) {
      toast.error(
        (Array.isArray(detail) ? detail[0]?.msg : detail) ||
          error?.message ||
          "Something went wrong"
      );
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
