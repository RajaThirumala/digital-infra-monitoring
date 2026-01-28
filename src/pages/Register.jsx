import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dbService from "../appwrite/Database.services";
import AccountService from "../appwrite/Account.services";

export default function Register() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    state: "",
    district: "",
    zone: "",
    school: "",
    selfIntro: "",
  });

  // Load states
  useEffect(() => {
    dbService.getStates().then(setStates).catch(console.error);
  }, []);

  // Load districts
  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      setZones([]);
      setSchools([]);
      setFormData(p => ({ ...p, district: "", zone: "", school: "" }));
      return;
    }
    dbService.getDistrictsByState(formData.state).then(setDistricts).catch(console.error);
  }, [formData.state]);

  // Load zones
  useEffect(() => {
    if (!formData.district || !["technician", "schooladmin"].includes(formData.role.toLowerCase())) {
      setZones([]);
      setSchools([]);
      setFormData(p => ({ ...p, zone: "", school: "" }));
      return;
    }
    dbService.getZonesByDistrict(formData.district).then(setZones).catch(console.error);
  }, [formData.district, formData.role]);

  // Load schools
  useEffect(() => {
    if (!formData.zone || formData.role.toLowerCase() !== "schooladmin") {
      setSchools([]);
      setFormData(p => ({ ...p, school: "" }));
      return;
    }
    dbService.getSchoolsByZone(formData.zone).then(setSchools).catch(console.error);
  }, [formData.zone, formData.role]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      const user = await AccountService.createUser(
        formData.email,
        formData.password,
        formData.name
      );

      // Auto-login after create (minimal addition)
      await AccountService.login(formData.email, formData.password);

      let parentAdminId = null;

      const role = formData.role.toLowerCase();

      if (role === "stateadmin") {
        parentAdminId = "696b9008000178869ab2";
      } else if (role === "districtadmin") {
        const stateAdmin = await dbService.getStateAdmin(formData.state);
        parentAdminId = stateAdmin?.userId || null;
      } else if (["technician", "schooladmin"].includes(role)) {
        const districtAdmin = await dbService.getDistrictAdmin(formData.district);
        parentAdminId = districtAdmin?.userId || null;
      }

      let requestData = {
        userId: user.$id,
        requestedRole: role,
        parentAdminId,
        selfIntro: formData.selfIntro || "",
        status: "pending",
        state: formData.state || null,
        district: formData.district || null
      };

      await dbService.createUserRequest(requestData);

      navigate("/waiting-approval");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong during registration");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Register</h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full border p-3 rounded mb-4" />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border p-3 rounded mb-4" />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full border p-3 rounded mb-4" />

        <select name="role" value={formData.role} onChange={handleChange} required className="w-full border p-3 rounded mb-4">
          <option value="">-- Select Role --</option>
          <option value="stateadmin">State Admin</option>
          <option value="districtadmin">District Admin</option>
          <option value="technician">Technician</option>
          <option value="schooladmin">School Admin</option>
        </select>

        {/* State dropdown for State Admin and District Admin */}
        {["stateadmin", "districtadmin", "technician", "schooladmin"].includes(formData.role.toLowerCase()) && (
          <select name="state" value={formData.state} onChange={handleChange} required className="w-full border p-3 rounded mb-4">
            <option value="">-- Select State --</option>
            {states.map(s => <option key={s.$id} value={s.$id}>{s.name}</option>)}
          </select>
        )}

        {/* District dropdown for all except State Admin */}
        {["districtadmin", "technician", "schooladmin"].includes(formData.role.toLowerCase()) && (
          <select name="district" value={formData.district} onChange={handleChange} required className="w-full border p-3 rounded mb-4">
            <option value="">-- Select District --</option>
            {districts.map(d => <option key={d.$id} value={d.$id}>{d.name}</option>)}
          </select>
        )}

        {/* Zone for Technician and School Admin */}
        {["technician", "schooladmin"].includes(formData.role.toLowerCase()) && (
          <select name="zone" value={formData.zone} onChange={handleChange} className="w-full border p-3 rounded mb-4">
            <option value="">-- Select Zone --</option>
            {zones.map(z => <option key={z.$id} value={z.$id}>{z.name}</option>)}
          </select>
        )}

        {/* School for School Admin */}
        {formData.role.toLowerCase() === "schooladmin" && (
          <select name="school" value={formData.school} onChange={handleChange} className="w-full border p-3 rounded mb-4">
            <option value="">-- Select School --</option>
            {schools.map(s => <option key={s.$id} value={s.$id}>{s.name}</option>)}
          </select>
        )}

        <textarea name="selfIntro" placeholder="Self Introduction" value={formData.selfIntro} onChange={handleChange} className="w-full border p-3 rounded mb-4" />

        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 transition">Submit</button>
      </form>
    </div>
  );
}