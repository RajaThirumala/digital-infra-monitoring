import { ID } from "appwrite";
import { account } from "./index";

class AccountService {
  // LOGIN
  async login(email, password) {
    return await account.createEmailPasswordSession(email, password);
  }

  // LOGOUT
  async logout() {
    return await account.deleteSession("current");
  }

  // GET CURRENT AUTH USER
  async getCurrentUser() {
    return await account.get();
  }
}

const accountService = new AccountService();
export default accountService;
