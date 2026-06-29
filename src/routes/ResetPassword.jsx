import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaChartLine, FaArrowLeft } from "react-icons/fa";
import PasswordInput from "../components/PasswordInput";

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
  : "/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/reset-password`, { token, password });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Invalid reset link</h2>
          <p className="text-sm text-gray-500">This link is missing or has expired.</p>
          <Link to="/forgot-password" className="font-bold text-blue-600 hover:text-blue-500">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <FaChartLine className="text-3xl text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Set a new password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose a strong password for your Trackwise account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              minLength={6}
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
