import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [state, setState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerify, setOtpVerify] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { login, sendOtp, verifyOtp } = useContext(AuthContext);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setOtpVerify(false);
    setIsLoading(false);
  };

  const switchToLogin = () => {
    setState("Login");
    resetForm();
  };

  const switchToSignUp = () => {
    setState("Sign up");
    resetForm();
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!agreeTerms) {
      toast.error("Please agree to the terms before proceeding.");
      return;
    }

    setIsLoading(true);

    try {
      if (state === 'Sign up') {
        if (!otpSent) {
          const response = await sendOtp(email);
          if (response.success) setOtpSent(true);
          return;
        }

        if (!otpVerify) {
          const response = await verifyOtp({ email, otp });
          if (response.success) {
            setOtpVerify(true);
            const formData = { fullName, email, password };
            const res = await login('signup', formData);
            if (res?.success) {
              toast.success("Signup successful! Redirecting...");
              navigate("/");
            }
          }
          return;
        }
      } else {
        const loginData = { email, password };
        await login('login', loginData);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmitButtonLabel = () => {
    if (state === "Sign up") {
      if (!otpSent) return "Signup";
      if (!otpVerify) return "Verify OTP";
      return "Verifying...";
    }
    return "Login Now";
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <form
        onSubmit={onSubmitHandler}
        className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col rounded-lg shadow-lg gap-4 max-w-md w-full'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {state}
        </h2>

        {state === "Sign up" && (
          <>
            <input
              type='text'
              placeholder='Full Name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
            />
            <input
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
            />
            {otpSent && !otpVerify && (
              <input
                type='text'
                placeholder='Enter OTP'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className='p-2 border border-gray-500 rounded-md focus:outline-none'
              />
            )}
          </>
        )}

        {state === "Login" && (
          <>
            <input
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
            />
          </>
        )}

        <button
          type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md flex justify-center items-center gap-2 disabled:opacity-60'
          disabled={isLoading}
        >
          {isLoading ? (
            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          ) : (
            getSubmitButtonLabel()
          )}
        </button>

        <label className='flex items-center gap-2 text-sm text-gray-300'>
          <input
            type='checkbox'
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
          />
          Agree to the terms of use & privacy policy.
        </label>

        <div className='text-sm text-gray-500'>
          {state === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={switchToLogin}
                className='text-violet-400 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don’t have an account?{" "}
              <span
                onClick={switchToSignUp}
                className='text-violet-400 cursor-pointer'
              >
                Create one
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
