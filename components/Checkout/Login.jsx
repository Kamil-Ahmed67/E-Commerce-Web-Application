"use client";
import { useAuth } from "@/provider/AuthProvider";
import { useState } from "react";
const Login = () => {
  const [dropdown, setDropdown] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { login, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials, config.tenantId);
    if (!error) {
      setCredentials({ email: "", password: "" });
    }
  };

  return (
    <div className="bg-white shadow-1 rounded">
      <div
        onClick={() => setDropdown(!dropdown)}
        className={`cursor-pointer flex items-center gap-0.5 py-5 px-5.5 ${
          dropdown && "border-b border-gray-300"
        }`}
      >
        Returning customer?
        <span className="flex items-center gap-2.5 pl-1 font-medium text-gray-700">
          Click here to login
          <svg
            className={`${
              dropdown && "rotate-180"
            } fill-current ease-out duration-500`}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
              fill=""
            />
          </svg>
        </span>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`${
          dropdown ? "block" : "hidden"
        } pt-6 pb-8.5 px-4 sm:px-8.5`}
      >
        <p className="text-custom-sm mb-5 text-gray-600">
          If you didn&apos;t Logged in, Please Log in first.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Removed the form tags but kept all form elements */}
        <div>
          <div className="mb-3">
            <label htmlFor="email" className="block text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={credentials.email}
              onChange={handleChange}
              className="rounded-md border border-gray-300 placeholder:text-gray-500 w-full py-2 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="on"
              value={credentials.password}
              onChange={handleChange}
              className="rounded-md border border-gray-300 placeholder:text-gray-500 w-full py-2 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <button
            type="button" // Changed to type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex font-medium text-sm text-white bg-[#32BBAB] hover:bg-[#2ca193] py-3 px-6 rounded-md ease-out duration-200 disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;