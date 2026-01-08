import { Link } from "react-router-dom";
function Home() {
  return (
    <div className="flex flex-col justify-center items-center text-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
        Digital Infrastructure Management System
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
        A centralized platform for managing government school digital infrastructure efficiently.
      </p>
      <div className="flex gap-4">
        <Link to="/register" className="bg-blue-900 text-white px-6 py-3 rounded hover:bg-blue-800 transition">
          Get Started
        </Link>
        <Link to="/login" className="bg-white border border-blue-900 text-blue-900 px-6 py-3 rounded hover:bg-blue-900 hover:text-white transition">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
