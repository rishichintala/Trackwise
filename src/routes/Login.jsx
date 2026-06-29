import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaChartLine } from "react-icons/fa";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            toast.success("Welcome back!");
            navigate("/dashboard");
        } else {
            toast.error(res.message);
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
                        Sign in to Trackwise
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Welcome back! Please enter your details.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>

                    <div className="flex justify-end -mt-2">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
