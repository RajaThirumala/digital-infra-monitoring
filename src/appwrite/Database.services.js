// src/appwrite/Database.services.js
import { Databases, Query, ID } from "appwrite";
import client from "./index";

import {
  APPWRITE_DATABASE_ID,
  APPWRITE_STATES_ID,
  APPWRITE_DISTRICTS_ID,
  APPWRITE_ZONES_ID,
  APPWRITE_SCHOOLS_ID,
  APPWRITE_USER_REQUESTS_ID,
} from "../utils/appwrite/constants";

// Replace with your actual Issues collection ID
const APPWRITE_ISSUES_ID = "your_issues_collection_id_here"; // ← update when created

class DatabaseService {
  constructor() {
    this.databases = new Databases(client);
  }

  // Helper: List documents or return empty on error
  async _listDocuments(collectionId, queries = []) {
    try {
      const response = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        collectionId,
        queries
      );
      return response.documents;
    } catch (error) {
      console.error(`Error listing from ${collectionId}:`, error);
      return [];
    }
  }

  // ────────────────────────────────────────────────
  // Dropdown / Cascading data – FIXED queries
  // ────────────────────────────────────────────────

  async getStates() {
    return this._listDocuments(APPWRITE_STATES_ID);
  }

  async getDistrictsByState(stateId) {
    return this._listDocuments(APPWRITE_DISTRICTS_ID, [
      Query.equal("states", stateId),  // ← FIXED: using correct attribute "states"
    ]);
  }

  async getZonesByDistrict(districtId) {
    return this._listDocuments(APPWRITE_ZONES_ID, [
      Query.equal("districts", districtId),  // ← assume similar "districts" relationship
      // If it's actually "district" or "districtId", change here after checking
    ]);
  }

  async getSchoolsByZone(zoneId) {
    return this._listDocuments(APPWRITE_SCHOOLS_ID, [
      Query.equal("zones", zoneId),  // ← assume "zones" relationship
      // If it's "zone" or "zoneId", change here after checking
    ]);
  }

  // For District Admin dashboard
  async getSchoolsByDistrict(districtId) {
    return this._listDocuments(APPWRITE_SCHOOLS_ID, [
      Query.equal("districts", districtId),
    ]);
  }

  async getIssuesBySchool(schoolId) {
    return this._listDocuments(APPWRITE_ISSUES_ID, [
      Query.equal("school", schoolId),
      Query.orderDesc("$createdAt"),
    ]);
  }

  // ────────────────────────────────────────────────
  // User Requests / Approval (unchanged)
  // ────────────────────────────────────────────────

  async createUserRequest(data) {
    try {
      return await this.databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_REQUESTS_ID,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Error creating user request:", error);
      throw new Error(error.message || "Failed to create request");
    }
  }

  async getStateAdmin(stateId) {
    const requests = await this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "stateadmin"),
      Query.equal("status", "approved"),
      Query.equal("state", stateId),
    ]);
    return requests[0] || null;
  }

  async getDistrictAdmin(districtId) {
    const requests = await this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "districtadmin"),
      Query.equal("status", "approved"),
      Query.equal("district", districtId),
    ]);
    return requests[0] || null;
  }

  async getStateAdminRequests() {
    return this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "stateadmin"),
      Query.equal("status", "pending"),
    ]);
  }

  async getdistrictAdminRequests() {
    return this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "districtadmin"),
      Query.equal("status", "pending"),
    ]);
  }

  async getTechnicianRequests() {
    return this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "technician"),
      Query.equal("status", "pending"),
    ]);
  }

  async getschoolAdminRequests() {
    return this._listDocuments(APPWRITE_USER_REQUESTS_ID, [
      Query.equal("requestedRole", "schooladmin"),
      Query.equal("status", "pending"),
    ]);
  }
}

export default new DatabaseService();