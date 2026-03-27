'use client';

import  { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";
const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    retypePassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!form.name || !form.email || !form.phone || !form.password || !form.retypePassword) {
        alert("Please fill all fields");
        return;
      }

      if (form.password !== form.retypePassword) {
        alert("Passwords do not match");
        return;
      }

      const payload = {
        Name: form.name,
        Email: form.email,
        Phone: form.phone,
        Password: form.password,
        UserRole: "Customer",
      };

      const response = await fetch(
        `${config.API_BASE_URL}api/EOrder/CustomerRegistration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            TenantId: config.tenantId,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      alert("Registration successful!");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        retypePassword: "",
      });

      setTimeout(() => {
        router.push("/signin");
      }, 2000);

    } catch (error) {
      console.error(error?.message || "Registration error");
      alert(error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className=" overflow-hidden py-10 pt-32 manrope bg-center manrope  bg-cover bg-no-repeat"
       style={{ backgroundImage: "url('/images/banner/bms-footer2.jpg')" }}
      >
      <div className="max-w-292.5 mx-auto px-4 sm:px-8">
        <div className="max-w-142.5 mx-auto rounded bg-gray-100/20 shadow p-4 sm:p-7 xl:p-11">
          <div className="text-center mb-4">
            <h2 className="font-semibold text-xl sm:text-2xl text-white mb-1.5">
              Create an Account
            </h2>
            <p className="text-white">Enter your detail below</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5.5">
            {/* Name */}
            <div className="mb-5">
              <label className="block text-white mb-2.5">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 bg-gray-100/70 py-3 px-5"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-white mb-2.5">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 bg-gray-100/70 py-3 px-5"
                required
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-white mb-2.5">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 bg-gray-100/70 py-3 px-5"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-white mb-2.5">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded border border-gray-300 bg-gray-100/70 py-3 px-5"
                required
              />
            </div>

            {/* Retype Password */}
            <div className="mb-5">
              <label className="block text-white mb-2.5">Re-type Password *</label>
              <input
                type="password"
                name="retypePassword"
                value={form.retypePassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded border border-gray-300 bg-gray-100/70 py-3 px-5"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded text-white bg-black hover:bg-[#32BBAB] transition ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-white mt-6">
              Already have an account?
              <Link
                href="/signin"
                prefetch={false}
                className="pl-2 hover:text-[#32BBAB]"
              >
                Sign in Now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
