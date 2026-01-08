import { TablesDB, Query } from "appwrite";
import appwriteClient from "."; // make sure your Appwrite client is initialized here
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_STATES_ID,
  APPWRITE_DISTRICTS_ID,
  APPWRITE_ZONES_ID,
  APPWRITE_SCHOOLS_ID,
} from "../utils/appwrite/constants"; // your collection IDs

class DatabaseService {
  constructor() {
    this.tablesDB = new TablesDB(appwriteClient);
  }

  // Get all states
  async getStates() {
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID, 
        tableId: APPWRITE_STATES_ID,
        queries: [Query.equal("countryCode", "IN")]
    });
      return res.rows; // returns array of { $id, name, ... }
    } catch (err) {
      console.error("Error fetching states:", err);
      return [];
    }
  }

  // Get districts based on selected state
  async getDistrictsByState(stateId) {
    console.log(stateId);
    try {
      const res = await this.tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: APPWRITE_DISTRICTS_ID,
          queries: [Query.equal("states", stateId)]
        });
      return res.rows;
    } catch (err) {
      console.error("Error fetching districts:", err);
      return [];
    }
  }

  // Get zones based on selected district
  async getZonesByDistrict(districtId) {
    console.log(districtId);
    try {
      const res = await this.tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID, 
        tableId: APPWRITE_ZONES_ID,
        queries: [Query.equal("districts", districtId)]
    });
      return res.rows;
    } catch (err) {
      console.error("Error fetching zones:", err);
      return [];
    }
  }

  // Get schools based on selected zone
  async getSchoolsByZone(zoneId) {
    try {
      const res = await this.tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: APPWRITE_SCHOOLS_ID, 
          queries: [Query.equal("zones", zoneId)]
    });
      return res.rows;
    } catch (err) {
      console.error("Error fetching schools:", err);
      return [];
    }
  }
}

export default DatabaseService;
