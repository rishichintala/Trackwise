import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

const inputClassName =
  "block w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all text-gray-900 sm:text-sm";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  required = true,
  id,
  minLength,
  className = "",
  inputClassName: customInputClassName,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 text-gray-400 transition-colors">
        <FaLock />
      </div>
      <input
        id={id}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className={customInputClassName || inputClassName}
        placeholder={placeholder}
        autoComplete={placeholder.toLowerCase().includes("confirm") ? "new-password" : "current-password"}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}
