"use client";
import { login } from "@/app/actions/auth/login";
import { Shield, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast/headless";
import OTPInput from "react-otp-input";
import { useAuth } from "@/context/authContext";

interface OTPVerifiFormProps {
  setStep: Dispatch<SetStateAction<"phone" | "otp">>;
  phone: string;
}

export const OTPVerifiForm: FC<OTPVerifiFormProps> = ({ setStep, phone }) => {
  const { setUserAuth } = useAuth();
  const { handleSubmit } = useForm();
  const [otp, setOtp] = useState<string>("");
  const [seconds, setSeconds] = useState(60); // Start from 60 seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const router = useRouter();

  // Countdown Timer Effect
  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      setIsResendDisabled(true);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false); // Enable resend when timer reaches 0
    }
  }, [seconds]);

  // Resend OTP Handler
  const handleResend = async () => {
    if (isResendDisabled) return;

    // Here you should call your resend OTP API
    // await resendOtp(phone);

    toast.success("کد تأیید مجدداً ارسال شد");
    setSeconds(60); // Reset timer
    setIsResendDisabled(true);
    setOtp(""); // Optional: clear OTP input
  };

  const onSubmit = async () => {
    if (otp.length !== 5) {
      toast.error("لطفاً کد ۵ رقمی را کامل وارد کنید");
      return;
    }

    const response = await login(
      { phone: +phone, code: +otp },
      {
        token: 1,
        user: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          phone: 1,
          email: 1,
          gender: 1,
          personnel_code: 1,
          birth_date: 1,
          is_active: 1,
        },
      }
    );

    if (response.success) {
      toast.success("ورود با موفقیت انجام شد");
      await setUserAuth(response.body.token);
      router.replace("/dashboard/letter/send");
    } else {
      toast.error(response.body.message || "کد وارد شده اشتباه است");
    }
  };

  function maskMiddleDigits(numberInput: string | number): string {
    const numberStr = String(numberInput);  // Coerce to string to avoid type issues
    const n = numberStr.length;
    if (n < 3) {
      return numberStr; // اگر کمتر از 3 رقم باشد، همان را برگردان
    }
    // محاسبه موقعیت شروع سه رقم وسط
    const start = Math.floor((n - 3) / 2);
    // جایگزینی سه رقم با ***
    const masked = numberStr.slice(0, start) + '***' + numberStr.slice(start + 3);
    return masked;
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <Shield className="text-5xl text-green-500 mb-4 mx-auto" size={48} />
        <h2 className="text-xl font-bold mb-2">کد تأیید</h2>
        <p className="text-slate-400 text-sm">
          کد ۵ رقمی به{" "}
          <span className="text-green-500 font-semibold">{maskMiddleDigits(phone)}</span> ارسال شد
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <OTPInput
          value={otp}
          onChange={setOtp}
          inputType="tel"
          numInputs={5}
          shouldAutoFocus
          containerStyle={{ direction: "ltr" }}
          inputStyle={{
            width: "56px",
            height: "64px",
          }}
          renderSeparator={<span className="text-white/50"> - </span>}
          renderInput={(props) => (
            <input
              {...props}
              className="w-14 h-16 text-center text-2xl font-bold bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          )}
        />
      </div>

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={otp.length !== 5}
        className={`w-full bg-linear-to-r from-green-500 to-emerald-500 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${otp.length !== 5
          ? "opacity-60 cursor-not-allowed"
          : "hover:from-green-600 hover:to-emerald-600 shadow-lg"
          }`}
      >
        <Check size={20} />
        تأیید و ورود
      </button>

      <div className="flex justify-between items-center mt-4 text-sm">
        <button
          onClick={handleResend}
          disabled={isResendDisabled}
          className={`transition-colors underline ${isResendDisabled
            ? "text-gray-500 cursor-not-allowed"
            : "text-green-500 hover:text-green-400"
            }`}
        >
          ارسال مجدد کد
        </button>
        <button
          onClick={() => setStep("phone")}
          className="text-slate-400 hover:text-slate-300 transition-colors"
        >
          تغییر شماره
        </button>
      </div>

      <div className="text-center mt-4 text-amber-400 text-sm font-medium">
        {seconds > 0 ? (
          <>ارسال مجدد در <span className="font-mono text-lg">{seconds.toString().padStart(2, "0")}</span> ثانیه</>
        ) : (
          <span className="text-green-400">اکنون می‌توانید کد را مجدداً دریافت کنید</span>
        )}
      </div>
    </div>
  );
};