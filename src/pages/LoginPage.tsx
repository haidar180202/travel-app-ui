import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useAppSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Jika sudah login (ada token), redirect ke halaman utama atau artikel
  useEffect(() => {
    if (token) {
      navigate("/articles");
    }
  }, [token, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ identifier, password }));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
