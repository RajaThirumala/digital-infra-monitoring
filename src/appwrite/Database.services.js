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
          Query.equal("schoolId", schoolId),
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
    console.log("data",data);
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
    console.log(adminId);
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
      return res.rows[0] || null;
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
          Query.equal("technicianId", technicianId),
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

  async updateIssueStatus(issueId, newStatus){
   console.log(issueId);
   console.log(newStatus);
   try{
   await this.tablesDB.updateRow(
    APPWRITE_DATABASE_ID,
    APPWRITE_ISSUES_ID,
    issueId,
    { status: newStatus }
);
   }
   catch (err){
    console.log("Error updating the status",err);
   }
  }
  async getDistrictIdByAdmin(districtAdminId) {
  try {
    console.log("Fetching district for user ID:", districtAdminId);

    const res = await this.tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_USER_REQUESTS_ID,
      queries: [
        Query.equal("userId", districtAdminId),
        Query.equal("requestedRole", "districtadmin"),
        Query.equal("status", "approved"),
      ],
    });

    console.log("User requests query result:", res);
    console.log("Number of approved requests found:", res.rows.length);

    if (res.rows.length === 0) {
      console.warn("No approved district admin request found for user:", districtAdminId);
      return null;
    }

    // Get the district ID from the approved request row
    const districtId = res.rows[0].district;

    if (!districtId) {
      console.warn("Approved request found, but no 'district' value:", res.rows[0]);
      return null;
    }

    console.log("Found district ID:", districtId);
    return districtId;
  } catch (err) {
    console.error("Error in getDistrictIdByAdmin:", err);
    return null;
  }
}

    async getTechnicianByZone(zoneId){
      try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_USER_REQUESTS_ID,
        queries: [
          Query.equal("zone", zoneId),
          Query.equal("requestedRole", "technician"),
          Query.equal("status", "approved"),
        ],
      });
       console.log("res",res);
      console.log("technican",res.rows[0]["userName"]);
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error fetching technicianname:", err);
      return null;
    }
    }
}
// Inside the class DbService { ... }
export default new DatabaseService();