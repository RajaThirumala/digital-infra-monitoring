import { TablesDB, Query, ID } from "appwrite";
import appwriteClient from ".";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_STATES_ID,
  APPWRITE_DISTRICTS_ID,
  APPWRITE_ZONES_ID,
  APPWRITE_SCHOOLS_ID,
  APPWRITE_USER_REQUESTS_ID,
  APPWRITE_ISSUES_ID
} from "../utils/appwrite/constants";

class DatabaseService {
  constructor() {
    this.tablesDB = new TablesDB(appwriteClient);
  }

  // ====== Helper functions for dropdowns ======
  async getStates() {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_STATES_ID,
      });
      return res.rows;
    } catch (err) {
      console.error("Error fetching states:", err);
      return [];
    }
  }

  async getDistrictsByState(stateId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_DISTRICTS_ID,
        queries: [Query.equal("states", stateId)],
      });
      return res.rows;
    } catch (err) {
      console.error("Error fetching districts:", err);
      return [];
    }
  }

  async getZonesByDistrict(districtId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_ZONES_ID,
        queries: [Query.equal("districts", districtId)],
      });
      return res.rows;
    } catch (err) {
      console.error("Error fetching zones:", err);
      return [];
    }
  }

  async getSchoolsByZone(zoneId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_SCHOOLS_ID,
        queries: [Query.equal("zones", zoneId)],
      });
      return res.rows;
    } catch (err) {
      console.error("Error fetching schools:", err);
      return [];
    }
  }

  // ====== User Request functions ======
  async createUserRequest(data) {
    return await this.tablesDB.createRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      rowId: ID.unique(),
      data,
    });
  }

  async getStateAdmin(stateId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_USER_REQUESTS_ID,
        queries: [
          Query.equal("requestedRole", "stateadmin"),
          Query.equal("status", "approved"),
          Query.equal("state", stateId),
        ],
      });
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error fetching state admin:", err);
      return null;
    }
  }

  async getDistrictAdmin(districtId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_USER_REQUESTS_ID,
        queries: [
          Query.equal("requestedRole", "districtadmin"),
          Query.equal("status", "approved"),
          Query.equal("district", districtId),
        ],
      });
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error fetching district admin:", err);
      return null;
    }
  }

  //getStateAdminRequests
  async getStateAdminRequests() {
    const res = await this.tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      queries: [
        Query.equal("requestedRole", "stateadmin"),
        Query.equal("status", "pending")
      ]
    });

    return res.rows;
  }

  //getDistrictAdminRequests
  async getdistrictAdminRequests() {
    const res = await this.tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      queries: [
        Query.equal("requestedRole", "districtadmin"),
        Query.equal("status", "pending")
      ]
    });

    return res.rows;
  }

  async getTechnicianRequests() {
    const res = await this.tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      queries: [
        Query.equal("requestedRole", "technician"),
        Query.equal("status", "pending")
      ]
    });

    return res.rows;
  }

  async getschoolAdminRequests() {
    const res = await this.tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      queries: [
        Query.equal("requestedRole", "schooladmin"),
        Query.equal("status", "pending")
      ]
    });

    return res.rows;
  }

  // ────────────────────────────────────────────────
  // NEW METHODS ADDED ONLY FOR SCHOOL ADMIN DASHBOARD
  // ────────────────────────────────────────────────
  async getUserName(userId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_USER_REQUESTS_ID,
        queries: [
          Query.equal("userId", userId),
        ],
      });
      // console.log("res",res);
      console.log("school",res.rows[0]["userName"]);
      return res.rows[0]["userName"] || null;
    } catch (err) {
      console.error("Error fetching userName:", err);
      return null;
    }
  }

  async getIssuesBySchool(schoolId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_ISSUES_ID,
        queries: [
          Query.equal("schoolId", schoolId), // your relationship field is "schools"
          Query.orderDesc("$createdAt"),
        ],
      });
      return res.rows;
    } catch (err) {
      console.error("Error fetching issues by school:", err);
      return [];
    }
  }

  async createIssue(data) {
    try {
      console.log(data);
      return await this.tablesDB.createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_ISSUES_ID,
        rowId: ID.unique(),
        data,
      });
    } catch (err) {
      console.error("Error creating issue:", err);
      throw new Error(err.message || "Failed to report issue");
    }
  }

  async getSchoolIdByAdmin(adminId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_USER_REQUESTS_ID,
        queries: [
          Query.equal("userId", adminId),
        ],
      });
      // console.log("res",res);
      console.log("school",res.rows[0]["school"]);
      return res.rows[0]["school"] || null;
    } catch (err) {
      console.error("Error fetching school by admin:", err);
      return null;
    }
  }

  async getSchoolDetailsById(schoolId) {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_SCHOOLS_ID,
        queries: [
          Query.equal("$id", schoolId),
        ],
      });
      // console.log("res",res);
      console.log("schoolName",res.rows[0]["name"]);
      return res.rows[0]["name"] || null;
    } catch (err) {
      console.error("Error fetching schoolName by schoolId:", err);
      return null;
    }
  }

  async getIssuesByAssignedTo(technicianId) {
      try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_ISSUES_ID,
        queries: [
          Query.equal("assignedTo", technicianId),
        ],
      });
      // console.log("res",res);
      console.log("issue1: ",res);
      return res.rows|| null;
    } catch (err) {
      console.error("Error fetching Issues by technicianId:", err);
      return null;
    }
  }
}

export default new DatabaseService();