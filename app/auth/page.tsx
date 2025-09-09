"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BiUser,
  BiPhone,
  BiLock,
  BiLockAlt,
  BiLogIn,
  BiUserPlus,
} from "react-icons/bi";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!isLogin && formData.username.length < 3) {
      newErrors.name = "نام باید حداقل ۳ حرف باشد";
    }

    if (formData.phone.length !== 11) {
      newErrors.phone = "شماره موبایل باید ۱۱ رقم باشد";
    }

    if (formData.password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور مطابقت ندارد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (phoneNumber: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      return {
        token: data.token,
        user: {
          id: data.userId,
          username: formData.username, // You may want to get this from the response
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error("Login failed");
    }
  };

  const handleSignup = async (
    username: string,
    phoneNumber: string,
    password: string
  ) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, phoneNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      return {
        token: data.token,
        user: {
          username: data.username,
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error("خطا در ثبت نام");
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (isLogin) {
          const userData = await handleLogin(formData.phone, formData.password);
          toast.success(`خوش آمدید ${userData.user.username}`, {
            style: {
              background: "#312e81", // indigo-900
              color: "#fff",
            },
          });
          router.replace("/");
        } else {
          const userData = await handleSignup(
            formData.username,
            formData.phone,
            formData.password
          );
          toast.success(`ثبت نام ${userData.user.username} موفقیت انجام شد`, {
            style: {
              background: "#312e81",
              color: "#fff",
            },
          });
          router.replace("/");
        }
      } catch (error) {
        console.log("Authentication error:", error);
        toast.error("خطا در ورود به سیستم", {
          style: {
            background: "#312e81",
            color: "#fff",
          },
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200 p-4"
      dir="rtl"
    >
      <motion.div className="bg-indigo-50 rounded-xl shadow-lg p-8 w-full max-w-md my-10">
        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "login" : "signup"}>
            <h2 className="text-3xl font-bold text-indigo-700 text-center flex items-center justify-center gap-2">
              {isLogin ? "ورود" : "ثبت نام"}
              {/* {isLogin ? (
                <BiLogIn className="text-indigo-500" size={30} />
              ) : (
                <BiUserPlus className="text-indigo-500" size={30} />
              )} */}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {!isLogin && (
                <div className="relative">
                  <BiUser
                    className="absolute right-3 top-3.5 text-indigo-500"
                    size={20}
                  />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-white border border-indigo-300 text-indigo-900 focus:outline-none focus:border-indigo-500"
                    placeholder="نام و نام خانوادگی"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm block mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>
              )}

              <div className="relative">
                <BiPhone
                  className="absolute right-3 top-3.5 text-indigo-500"
                  size={20}
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 rounded-lg bg-white border border-indigo-300 text-indigo-900 focus:outline-none focus:border-indigo-500"
                  placeholder="شماره موبایل"
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="relative">
                <BiLock
                  className="absolute right-3 top-3.5 text-indigo-500"
                  size={20}
                />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 rounded-lg bg-white border border-indigo-300 text-indigo-900 focus:outline-none focus:border-indigo-500"
                  placeholder="رمز عبور"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm block mt-1">
                    {errors.password}
                  </span>
                )}
              </div>

              {!isLogin && (
                <div className="relative">
                  <BiLockAlt
                    className="absolute right-3 top-3.5 text-indigo-500"
                    size={20}
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-white border border-indigo-300 text-indigo-900 focus:outline-none focus:border-indigo-500"
                    placeholder="تکرار رمز عبور"
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm block mt-1">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                type="submit"
              >
                {isLogin ? <BiLogIn size={20} /> : <BiUserPlus size={20} />}
                {isLogin ? "ورود" : "ثبت نام"}
              </motion.button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {isLogin ? "ثبت نام نکرده‌اید؟" : "قبلاً ثبت نام کرده‌اید؟"}
                {isLogin ? <BiUserPlus size={20} /> : <BiLogIn size={20} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
