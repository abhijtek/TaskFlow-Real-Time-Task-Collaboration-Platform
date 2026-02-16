import api from "./api";
import { mockAuth } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const authService = {
  async login(email, password) {
    if (USE_MOCK) return mockAuth.login(email, password);
    return api.post("/auth/login", { email, password });
  },

  async signup(name, email, password) {
    if (USE_MOCK) return mockAuth.signup(name, email, password);
    return api.post("/auth/signup", { name, email, password });
  },

  async me() {
    if (USE_MOCK) {
      const token = typeof window !== "undefined" ? localStorage.getItem("taskflow_token") : null;
      return mockAuth.me(token);
    }
    return api.get("/auth/me");
  },
};
