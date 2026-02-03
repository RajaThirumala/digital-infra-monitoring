import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center">
      {/* Hero / Main heading */}
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-blue-900 md:text-5xl lg:text-6xl">
        Digital Infrastructure Management System
      </h1>

      {/* Subtitle / description */}
      <p className="mb-10 max-w-3xl text-lg text-gray-700 md:text-xl">
        A centralized platform for efficiently managing and tracking digital infrastructure in government schools — from reporting issues to assigning technicians and monitoring resolutions.
      </p>

      {/* Call-to-action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-8 py-3.5 font-medium text-white shadow-md transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Get Started – Register Now
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-lg border border-blue-900 bg-white px-8 py-3.5 font-medium text-blue-900 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Already have an account? Login
        </Link>
      </div>

      {/* Optional small footer note */}
      <p className="mt-12 text-sm text-gray-500">
        Designed for school administrators, technicians, district & state officials
      </p>
    </div>
  );
}

export default Home;