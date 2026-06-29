import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaChartLine, FaArrowLeft } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
  : "/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setSent(true);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {sent
              ? "Check your inbox for a reset link. It expires in 1 hour."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 text-gray-400 transition-colors">
                <FaEnvelope />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all text-gray-900 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            Didn&apos;t receive it? Check spam or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-bold text-blue-600 hover:text-blue-500"
            >
              try again
            </button>
            .
          </div>
        )}

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
