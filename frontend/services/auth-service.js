import api from "./api";
import { mockAuth } from "@/lib/mock-store";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isNetworkError = (err) => err?.error === "Network error";

export const authService = {
  async login(email, password) {
    if (USE_MOCK) return mockAuth.login(email, password);
    let attempt = 0;
    while (true) {
      try {
        return await api.post("/auth/login", { email, password });
      } catch (err) {
        attempt += 1;
        if (!isNetworkError(err) || attempt > 2) throw err;
        await delay(1000 * attempt);
      }
    }
  },

  async signup(name, email, password) {
    if (USE_MOCK) return mockAuth.signup(name, email, password);
    let attempt = 0;
    while (true) {
      try {
        return await api.post("/auth/signup", { name, email, password });
      } catch (err) {
        attempt += 1;
        if (!isNetworkError(err) || attempt > 2) throw err;
        await delay(1000 * attempt);
      }
    }
  },

  async me() {
    if (USE_MOCK) {
      const token = typeof window !== "undefined" ? localStorage.getItem("taskflow_token") : null;
      return mockAuth.me(token);
    }
    let attempt = 0;
    while (true) {
      try {
        return await api.get("/auth/me");
      } catch (err) {
        attempt += 1;
        if (!isNetworkError(err) || attempt > 2) throw err;
        await delay(1000 * attempt);
      }
    }
  },
};
