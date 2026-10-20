'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiFlag,
  FiMapPin,
  FiHome,
  FiHash,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import config from "@/config";
import { trackEvent } from "@/lib/trackEvent";
import districtsCities from "@/data/districtsCities.json";
import SignupSuccessModal from "./SignupSuccessModal";

const districtNames = Object.keys(districtsCities).sort();

const STEPS = [
  { key: "account", label: "Account" },
  { key: "profile", label: "Profile" },
];

const inputBase =
  "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#32BBAB] focus:border-[#32BBAB] transition-all placeholder-gray-400 bg-white text-gray-900";

const Field = ({ icon: Icon, children }) => (
  <div className="relative rounded shadow-sm">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    {children}
  </div>
);

const Signup = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    retypePassword: "",
    country: "Bangladesh",
    district: "",
    city: "",
    dob: "",
    gender: "",
    zip: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const cityOptions = useMemo(() => {
    if (!form.district) return [];
    return districtsCities[form.district] || [];
  }, [form.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "district") {
      setForm((prev) => ({ ...prev, district: value, city: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isAccountStepValid =
    form.name && form.email && form.phone && form.password && form.retypePassword;

  const isProfileStepValid =
    form.country && form.district && form.city && form.dob && form.gender;

  const goNext = () => {
    if (!isAccountStepValid) {
      alert("Please fill all account fields");
      return;
    }
    if (form.password !== form.retypePassword) {
      alert("Passwords do not match");
      return;
    }
    setStep(1);
  };

  const goBack = () => setStep(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isProfileStepValid) {
      alert("Please fill all profile fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Name: form.name,
        Email: form.email,
        Phone: form.phone,
        Password: form.password,
        UserRole: "Customer",
        Country: form.country,
        District: form.district,
        City: form.city,
        DateOfBirth: form.dob,
        Gender: form.gender,
        ZipCode: form.zip,
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

      setShowSuccessModal(true);

      trackEvent('sign_up', {
        email: form.email,
        phone: form.phone,
        name: form.name,
        country: form.country,
        district: form.district,
        city: form.city,
        zip: form.zip,
        dateOfBirth: form.dob,
        gender: form.gender,
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        retypePassword: "",
        country: "Bangladesh",
        district: "",
        city: "",
        dob: "",
        gender: "",
        zip: "",
      });
      setStep(0);
    } catch (error) {
      console.error(error?.message || "Registration error");
      alert(error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="overflow-hidden py-10 pt-40 manrope bg-center bg-cover bg-no-repeat min-h-screen"
      style={{ backgroundImage: "url('/images/banner/bms-footer2.jpg')" }}
    >
      <div className="max-w-292.5 mx-auto px-4 sm:px-8">
        <div className="max-w-xl mx-auto rounded-lg bg-white shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create an Account
            </h2>
            <p className="text-gray-600 text-lg">Join us in just two quick steps</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      i < step
                        ? "bg-[#32BBAB] text-white"
                        : i === step
                        ? "bg-linear-to-r from-teal-500 to-[#32BBAB] text-white ring-4 ring-[#32BBAB]/20"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <FiCheck className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      i <= step ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all ${
                      i < step ? "bg-[#32BBAB]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <Field icon={FiUser}>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={inputBase}
                      required
                    />
                  </Field>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <Field icon={FiMail}>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={inputBase}
                      required
                      autoComplete="email"
                    />
                  </Field>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                  <Field icon={FiPhone}>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      className={inputBase}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <Field icon={FiLock}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`${inputBase} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </Field>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Re-type Password *</label>
                    <Field icon={FiLock}>
                      <input
                        type={showRetypePassword ? "text" : "password"}
                        name="retypePassword"
                        value={form.retypePassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`${inputBase} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRetypePassword((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showRetypePassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </Field>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={goNext}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded shadow-sm text-lg font-medium text-white bg-linear-to-r from-teal-500 to-[#32BBAB] hover:from-[#3c7871] hover:to-[#32BBAB] transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32BBAB]"
                  >
                    Continue
                    <FiArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                    <Field icon={FiCalendar}>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        className={inputBase}
                        required
                      />
                    </Field>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <Field icon={FiUser}>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className={`${inputBase} appearance-none`}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Country/Region *</label>
                    <Field icon={FiFlag}>
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className={`${inputBase} appearance-none`}
                        required
                      >
                        <option value="Bangladesh">Bangladesh</option>
                      </select>
                    </Field>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <Field icon={FiHash}>
                      <input
                        type="text"
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputBase}
                      />
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">District/State *</label>
                    <Field icon={FiMapPin}>
                      <select
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        className={`${inputBase} appearance-none`}
                        required
                      >
                        <option value="">Select District</option>
                        {districtNames.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">City/Area *</label>
                    <Field icon={FiHome}>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        disabled={!form.district}
                        className={`${inputBase} appearance-none disabled:opacity-60 disabled:cursor-not-allowed`}
                        required
                      >
                        <option value="">
                          {form.district ? "Select City/Area" : "Pick district first"}
                        </option>
                        {cityOptions.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center justify-center gap-2 py-3 px-5 border border-gray-300 rounded shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded shadow-sm text-lg font-medium text-white bg-linear-to-r from-teal-500 to-[#32BBAB] hover:from-[#3c7871] hover:to-[#32BBAB] transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32BBAB] ${
                      isSubmitting ? "opacity-80" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              href="/signin"
              prefetch={false}
              className="font-medium text-[#5b9790] hover:text-[#32BBAB] transition-colors"
            >
              Sign in Now
            </Link>
          </p>
        </div>
      </div>

      <SignupSuccessModal
        open={showSuccessModal}
        onLogin={() => router.push("/signin")}
      />
    </section>
  );
};

export default Signup;
