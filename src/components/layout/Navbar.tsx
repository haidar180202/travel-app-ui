import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";


export const Navbar = () => {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <nav className="bg-white shadow px-4 py-2 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">TravelArticle</Link>
      <div className="space-x-4">
        {user ? (
          <>
            <span className="text-gray-700">Hi, {user.username}</span>
            <button onClick={() => dispatch(logout())} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
