// pages/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import clsx from "clsx";

import dbService from "../appwrite/Database.services";
import AccountService from "../appwrite/Account.services";

// ────────────────────────────────────────────────
// Validation Schema
// ────────────────────────────────────────────────
const schema = yup.object({
  name: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
    .matches(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/, "Must contain at least one number (0-9)")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),

  role: yup.string().required("Role is required"),
  state: yup.string().when("role", {
    is: (v) => ["stateadmin", "districtadmin", "technician", "schooladmin"].includes(v?.toLowerCase()),
    then: (s) => s.required("State is required"),
    otherwise: (s) => s.nullable(),
  }),
  district: yup.string().when("role", {
    is: (v) => ["districtadmin", "technician", "schooladmin"].includes(v?.toLowerCase()),
    then: (s) => s.required("District is required"),
    otherwise: (s) => s.nullable(),
  }),
  zone: yup.string().when("role", {
    is: (v) => ["technician", "schooladmin"].includes(v?.toLowerCase()),
    then: (s) => s.required("Zone is required"),
    otherwise: (s) => s.nullable(),
  }),
  school: yup.string().when("role", {
    is: "schooladmin",
    then: (s) => s.required("School is required"),
    otherwise: (s) => s.nullable(),
  }),
  selfIntro: yup.string().nullable(),
});

// Password strength checker for live feedback
const getPasswordStrength = (password = "") => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const satisfiedCount = Object.values(checks).filter(Boolean).length;

  return {
    isStrong: satisfiedCount === 5,
    checks,
  };
};

export default function Register() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [schools, setSchools] = useState([]);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      state: "",
      district: "",
      zone: "",
      school: "",
      selfIntro: "",
    },
  });

  const role = (watch("role") || "").toLowerCase();
  const stateId = watch("state");
  const districtId = watch("district");
  const zoneId = watch("zone");
  const password = watch("password") || "";

  const passwordStrength = getPasswordStrength(password);

  const needsState = ["stateadmin", "districtadmin", "technician", "schooladmin"].includes(role);
  const needsDistrict = ["districtadmin", "technician", "schooladmin"].includes(role);
  const needsZone = ["technician", "schooladmin"].includes(role);
  const isSchoolAdmin = role === "schooladmin";

  // Load dropdown data
  useEffect(() => {
    dbService.getStates().then(setStates).catch(console.error);
  }, []);

  useEffect(() => {
    if (!stateId) {
      setDistricts([]);
      setZones([]);
      setSchools([]);
      setValue("district", "");
      setValue("zone", "");
      setValue("school", "");
      return;
    }
    dbService.getDistrictsByState(stateId).then(setDistricts).catch(console.error);
  }, [stateId, setValue]);

  useEffect(() => {
    if (!districtId || !needsZone) {
      setZones([]);
      setSchools([]);
      setValue("zone", "");
      setValue("school", "");
      return;
    }
    dbService.getZonesByDistrict(districtId).then(setZones).catch(console.error);
  }, [districtId, needsZone, setValue]);

  useEffect(() => {
    if (!zoneId || !isSchoolAdmin) {
      setSchools([]);
      setValue("school", "");
      return;
    }
    dbService.getSchoolsByZone(zoneId).then(setSchools).catch(console.error);
  }, [zoneId, isSchoolAdmin, setValue]);

  const onSubmit = async (data) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      await AccountService.logout();
      const user = await AccountService.createUser(data.email, data.password, data.name);
      await AccountService.login(data.email, data.password);

      let parentAdminId = null;
      const r = data.role.toLowerCase();

      if (r === "stateadmin") {
        parentAdminId = "696b9008000178869ab2";
      } else if (r === "districtadmin") {
        const admin = await dbService.getStateAdmin(data.state);
        parentAdminId = admin?.userId ?? null;
      } else if (["technician", "schooladmin"].includes(r)) {
        const admin = await dbService.getDistrictAdmin(data.district);
        parentAdminId = admin?.userId ?? null;
      }
      console.log("username",user);
      await dbService.createUserRequest({
        userId: user.$id,
        userName: user.name,
        requestedRole: r,
        parentAdminId,
        selfIntro: data.selfIntro || "",
        status: "pending",
        state: data.state || null,
        district: data.district || null,
      });

      navigate("/waiting-approval");
    } catch (err) {
      console.error(err);
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl"
      >
        <h2 className="mb-8 text-center text-3xl font-bold text-blue-900">
          Create Your Account
        </h2>

        {serverError && (
          <div className="mb-6 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700">
            {serverError}
          </div>
        )}

        {/* Name */}
        <div className="mb-5">
          <input
            {...register("name")}
            placeholder="Full Name"
            disabled={isSubmitting}
            className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-5">
          <input
            {...register("email")}
            type="email"
            placeholder="Email Address"
            disabled={isSubmitting}
            className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* ────── PASSWORD FIELD WITH TOGGLE & STRENGTH FEEDBACK ────── */}
        <div className="mb-6">
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              disabled={isSubmitting}
              className={clsx(
                "w-full rounded border p-3 pr-12 focus:outline-none focus:ring-2",
                passwordStrength.isStrong
                  ? "border-green-500 focus:ring-green-500"
                  : password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              )}
            />

            {/* Eye toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex="-1"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Strength feedback */}
          {password && (
            <p
              className={clsx(
                "mt-2 text-sm font-medium flex items-center gap-2",
                passwordStrength.isStrong ? "text-green-700" : "text-red-600"
              )}
            >
              {passwordStrength.isStrong ? "✓ Strong password!" : "Password needs improvement"}
            </p>
          )}

          {/* Requirements checklist */}
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 shadow-inner">
            <p className="mb-2 font-medium">Password must contain:</p>
            <ul className="space-y-1.5">
              <li className={clsx("flex items-center gap-2", passwordStrength.checks.length && "text-green-700")}>
                <span>{passwordStrength.checks.length ? "✓" : "•"}</span>
                At least 8 characters
              </li>
              <li className={clsx("flex items-center gap-2", passwordStrength.checks.uppercase && "text-green-700")}>
                <span>{passwordStrength.checks.uppercase ? "✓" : "•"}</span>
                At least 1 uppercase letter (A-Z)
              </li>
              <li className={clsx("flex items-center gap-2", passwordStrength.checks.lowercase && "text-green-700")}>
                <span>{passwordStrength.checks.lowercase ? "✓" : "•"}</span>
                At least 1 lowercase letter (a-z)
              </li>
              <li className={clsx("flex items-center gap-2", passwordStrength.checks.number && "text-green-700")}>
                <span>{passwordStrength.checks.number ? "✓" : "•"}</span>
                At least 1 number (0-9)
              </li>
              <li className={clsx("flex items-center gap-2", passwordStrength.checks.special && "text-green-700")}>
                <span>{passwordStrength.checks.special ? "✓" : "•"}</span>
                At least 1 special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        {/* Role */}
        <div className="mb-5">
          <select
            {...register("role")}
            disabled={isSubmitting}
            className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Role --</option>
            <option value="stateadmin">State Admin</option>
            <option value="districtadmin">District Admin</option>
            <option value="technician">Technician</option>
            <option value="schooladmin">School Admin</option>
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>

        {/* State */}
        {needsState && (
          <div className="mb-5">
            <select
              {...register("state")}
              disabled={isSubmitting}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.$id} value={s.$id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
          </div>
        )}

        {/* District */}
        {needsDistrict && (
          <div className="mb-5">
            <select
              {...register("district")}
              disabled={isSubmitting}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d.$id} value={d.$id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
          </div>
        )}

        {/* Zone */}
        {needsZone && (
          <div className="mb-5">
            <select
              {...register("zone")}
              disabled={isSubmitting}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Zone --</option>
              {zones.map((z) => (
                <option key={z.$id} value={z.$id}>
                  {z.name}
                </option>
              ))}
            </select>
            {errors.zone && <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>}
          </div>
        )}

        {/* School */}
        {isSchoolAdmin && (
          <div className="mb-5">
            <select
              {...register("school")}
              disabled={isSubmitting}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select School --</option>
              {schools.map((s) => (
                <option key={s.$id} value={s.$id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>}
          </div>
        )}

        {/* Self Introduction */}
        <div className="mb-6">
          <textarea
            {...register("selfIntro")}
            placeholder="Self Introduction (optional)"
            disabled={isSubmitting}
            className="h-28 w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.selfIntro && <p className="mt-1 text-sm text-red-600">{errors.selfIntro.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "mt-6 w-full rounded py-3 font-semibold text-white transition",
            isSubmitting ? "cursor-not-allowed bg-blue-700 opacity-70" : "bg-blue-900 hover:bg-blue-800"
          )}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-700 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}