import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatabaseService from "../appwrite/Database.services"; // your DB service
import AccountService from "../appwrite/Account.services"; // your Appwrite account service

export default function Register() {
  const navigate = useNavigate();
  const dbService = new DatabaseService();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    state: "",
    role: "",
    district: "",
    zone: "",
    school: "",
  });

  // Fetch all states on component mount
  useEffect(() => {
    async function fetchStates() {
      const res = await dbService.getStates();
      console.log(res);
      console.log("avghszj")
      setStates(res);
    }
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    async function fetchDistricts() {
      if (formData.state) {
        const res = await dbService.getDistrictsByState(formData.state);
        setDistricts(res);
      } else {
        setDistricts([]);
        setZones([]);
        setSchools([]);
      }
      setFormData(prev => ({ ...prev, district: "", zone: "", school: "" }));
    }
    fetchDistricts();
  }, [formData.state]);

  // Fetch zones when district changes (for technician or school admin)
  useEffect(() => {
    async function fetchZones() {
      if (formData.district && (formData.role === "technician" || formData.role === "schooladmin")) {
        const res = await dbService.getZonesByDistrict(formData.district);
        setZones(res);
      } else {
        setZones([]);
        setSchools([]);
      }
      setFormData(prev => ({ ...prev, zone: "", school: "" }));
    }
    fetchZones();
  }, [formData.district, formData.role]);

  // Fetch schools when zone changes (for school admin)
  useEffect(() => {
    async function fetchSchools() {
      if (formData.zone && formData.role === "schooladmin") {
        const res = await dbService.getSchoolsByZone(formData.zone);
        setSchools(res);
      } else {
        setSchools([]);
      }
      setFormData(prev => ({ ...prev, school: "" }));
    }
    fetchSchools();
  }, [formData.zone, formData.role]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register user via AccountService
      await AccountService.register(formData);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {/* Name, Email, Password */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* State selection */}
        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="">--Select State--</option>
          {states.map((s) => (
            <option key={s.$id} value={s.$id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Role selection */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="">--Select Role--</option>
          <option value="stateadmin">State Admin</option>
          <option value="districtadmin">District Admin</option>
          <option value="technician">Technician</option>
          <option value="schooladmin">School Admin</option>
        </select>

        {/* Dynamic fields */}
        {(formData.role === "districtadmin" || formData.role === "technician" || formData.role === "schooladmin") && (
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-3"
          >
            <option value="">--Select District--</option>
            {districts.map((d) => (
              <option key={d.$id} value={d.$id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {(formData.role === "technician" || formData.role === "schooladmin") && (
          <select
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-3"
          >
            <option value="">--Select Zone--</option>
            {zones.map((z) => (
              <option key={z.$id} value={z.$id}>
                {z.name}
              </option>
            ))}
          </select>
        )}

        {formData.role === "schooladmin" && (
          <select
            name="school"
            value={formData.school}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-3"
          >
            <option value="">--Select School--</option>
            {schools.map((s) => (
              <option key={s.$id} value={s.$id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
