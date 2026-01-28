import { ID } from "appwrite";
import { account } from "./index";
class AccountService {
  // NEW: Check if authenticated
  async isAuthenticated() {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  }

  // CREATE USER
  async createUser(email, password, name) {
    return await account.create(ID.unique(), email, password, name);
  }

  // LOGIN
  async login(email, password) {
    return await account.createEmailPasswordSession(email, password);
  }

  // LOGOUT (Modified to check first)
  async logout() {
    if (await this.isAuthenticated()) {
      return await account.deleteSession("current");
    }
    // If no session, do nothing (no error thrown)
  }

  // GET CURRENT AUTH USER
  async getCurrentUser() {
    return await account.get();
  }
}

const accountService = new AccountService();
export default accountService;