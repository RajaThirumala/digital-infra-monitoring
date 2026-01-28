import { create } from "zustand";
import { persist } from "zustand/middleware";
import accountService from "../appwrite/Account.services";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      // Check if a session exists
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await accountService.getCurrentUser();
          set({ user });
          return user;
        } catch (err) {
          set({ user: null, error: err.message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await accountService.login(email, password);
          const user = await accountService.getCurrentUser();
          set({ user });
          return user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // Register action (create + auto-login)
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          await accountService.createUser(email, password, name);
          await accountService.login(email, password);
          const user = await accountService.getCurrentUser();
          set({ user });
          return user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await accountService.logout();
          set({ user: null });
        } catch (err) {
          console.error("Logout failed:", err);
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Centralized redirect 
      redirectAfterAuth: (user, navigate) => {
        if (!user.labels || user.labels.length === 0) {
          navigate("/waiting-approval");
          return;
        }
        if (user.labels.includes("superadmin")) navigate("/dashboard/super-admin");
        else if (user.labels.includes("stateadmin")) navigate("/dashboard/state-admin");
        else if (user.labels.includes("districtadmin")) navigate("/dashboard/district-admin");
        else if (user.labels.includes("technician")) navigate("/dashboard/technician");
        else if (user.labels.includes("schooladmin")) navigate("/dashboard/school-admin");
        else navigate("/waiting-approval");
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => sessionStorage.getItem(name),
        setItem: (name, value) => sessionStorage.setItem(name, value),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);

export default useAuthStore;