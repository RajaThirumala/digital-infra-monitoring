// store/authStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow"; // optional – better perf for selectors
import accountService from "../appwrite/Account.services";

// Helper to extract primary role from labels (you can adjust logic)
const getUserRole = (user) => {
  if (!user?.labels) return null;

  const roles = [
    "superadmin",
    "stateadmin",
    "districtadmin",
    "technician",
    "schooladmin",
  ];

  for (const role of roles) {
    if (user.labels.includes(role)) return role;
  }
  return null; // pending or unknown
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      role: null,           // ← normalized role (string or null)
      isLoading: false,
      error: null,

      // Computed / getters
      isAuthenticated: () => !!get().user && !!get().role,

      // Actions
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await accountService.getCurrentUser();
          const role = getUserRole(user);
          set({ user, role, error: null });
          return user;
        } catch (err) {
          set({ user: null, role: null, error: err.message || "Session expired" });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await accountService.login(email, password);
          const user = await accountService.getCurrentUser();
          const role = getUserRole(user);
          set({ user, role, error: null });
          return user;
        } catch (err) {
          const msg = err.message || "Invalid credentials";
          set({ error: msg });
          throw new Error(msg);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          await accountService.createUser(email, password, name);
          await accountService.login(email, password);
          const user = await accountService.getCurrentUser();
          const role = getUserRole(user); // usually null/pending at this stage
          set({ user, role, error: null });
          return user;
        } catch (err) {
          const msg = err.message || "Registration failed";
          set({ error: msg });
          throw new Error(msg);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await accountService.logout();
          set({ user: null, role: null, error: null });
        } catch (err) {
          console.error("Logout failed:", err);
          set({ error: err.message || "Logout failed" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Call this after superadmin approves the user (or on polling success)
      refreshUser: async () => {
        return get().checkAuth(); // just re-run checkAuth
      },

      // Set user manually (e.g., after approval webhook or polling)
      setUser: (user) => {
        const role = getUserRole(user);
        set({ user, role, error: null });
      },

      // Centralized redirect logic after login/register/approval
      redirectAfterAuth: (user, navigate) => {
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        const role = getUserRole(user) || get().role;
        console.log(role);

        // If pending or no role → waiting
        if (!role || role === "pending") {
          navigate("/waiting-approval", { replace: true });
          return;
        }

        const pathMap = {
          superadmin: "/dashboard/super-admin",
          stateadmin: "/dashboard/state-admin",
          districtadmin: "/dashboard/district-admin",
          technician: "/dashboard/technician",
          schooladmin: "/dashboard/school-admin",
        };

        const redirectTo = pathMap[role] || "/";
        console.log(redirectTo)
        navigate(redirectTo, { replace: true });
      },

      // Clear error manually if needed
      clearError: () => set({ error: null }),
    }),

    {
      name: "auth-storage",                     // key in storage
      storage: createJSONStorage(() => sessionStorage), // clears on tab close – good for security
      partialize: (state) => ({ user: state.user, role: state.role }), // only persist user & role
      onRehydrateStorage: () => {
        // Optional: auto-check session on app load
        return (state) => {
          if (state?.user) {
            // Optional: verify session is still valid
            accountService
              .getCurrentUser()
              .then((freshUser) => {
                const role = getUserRole(freshUser);
                state.setUser(freshUser); // update if changed
              })
              .catch(() => {
                state.logout(); // session expired → clear
              });
          }
        };
      },
    }
  )
);

// Optional: use shallow for better selector performance
export const useAuth = () => useAuthStore((s) => ({
  user: s.user,
  role: s.role,
  isAuthenticated: s.isAuthenticated(),
  isLoading: s.isLoading,
  error: s.error,
}), shallow);

export default useAuthStore;