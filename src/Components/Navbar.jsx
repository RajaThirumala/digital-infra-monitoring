import { Link } from "react-router-dom";

export default function Navbar() {
  
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-semibold text-lg hover:text-blue-300">
        Home
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/login" className="hover:text-blue-300">
          Login
        </Link>
        <Link to="/register" className="hover:text-blue-300">
          Register
        </Link>
      </div>
    </nav>
  );
}
