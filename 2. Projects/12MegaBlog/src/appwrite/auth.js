import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

export class AuthService {
  constructor() {
    this.client = new Client();

    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      if (!userAccount) {
        throw new Error("User creation failed");
      }

      // optional small delay (avoids rare race condition)
      await new Promise((res) => setTimeout(res, 300));

      return await this.login({ email, password });
    } catch (error) {
      console.error("AuthService :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      return await this.account.createEmailSession({
        email,
        password,
      });
    } catch (error) {
      console.error("AuthService :: login :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      if (error?.code !== 401) {
        console.error("AuthService :: getCurrentUser :: error", error);
      }
      return null;
    }
  }

  async logout() {
    try {
      await this.account.deleteSession("current"); // better than deleting all
      return true;
    } catch (error) {
      console.error("AuthService :: logout :: error", error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
