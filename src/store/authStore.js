import { create } from "zustand";
import { Account } from "appwrite";
import appwriteClient from "../appwrite";

const account = new Account(appwriteClient);

const useAuthStore = create((set) => ({
  user: null,

  // Check if a session exists
  checkAuth: async () => {
    try {
      const user = await account.get();
      set({ user });
    } catch {
      set({ user: null });
    }
  },

  // Logout
  logout: async () => {
    try {
      await account.deleteSession("current");
      set({ user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
}));

export default useAuthStore;
