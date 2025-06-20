import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const { login, sendOtp, verifyOtp } = useContext(AuthContext);

  // Reset relevant states on switching currState
  const switchToLogin = () => {
    setCurrState("Login");
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setIsDataSubmitted(false);
  };

  const switchToSignUp = () => {
    setCurrState("Sign up");
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setIsDataSubmitted(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (currState === 'Sign up') {
        if (!otpSent) {
          const response = await sendOtp(email);
          if (response.success) {
            setOtpSent(true);
          }
          return setIsLoading(false);
        }

        if (!otpVerified) {
          const response = await verifyOtp({ email, otp });
          if (response.success) {
            setOtpVerified(true);
          }
          return setIsLoading(false);
        }

        if (!isDataSubmitted) {
          setIsDataSubmitted(true);
          return setIsLoading(false);
        }

        // Final step: submit form
        const formData = { fullName, email, password, bio };
        console.log("Signup Data: ", formData);
        await login('signup', formData);
      } else {
        const loginData = { email, password };
        console.log("Login Data: ", loginData);
        await login('login', loginData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* _________________________Right________________________________ */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col rounded-lg shadow-lg gap-4'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {currState === "Sign up" && isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className='w-5 cursor-pointer'
            />
          )}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type='text'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              placeholder='Full Name'
              required
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type='email'
              placeholder='Email Address'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password'
              placeholder='Password'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'
            />

            {/* Show OTP input field if otpSent and not verified */}
            {otpSent && !otpVerified && (
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'
                required
              />
            )}
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Provide a short bio...'
            required
          ></textarea>
        )}

        {currState === "Login" && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type='email'
              placeholder='Email Address'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password'
              placeholder='Password'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'
            />
          </>
        )}

        <button
          type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer flex justify-center items-center gap-2'
          disabled={isLoading}
        >
          {isLoading ? (
            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          ) : currState === "Sign up" ? (
            !otpSent ? "Send OTP" :
              !otpVerified ? "Verify OTP" :
                isDataSubmitted ? "Submit Bio" : "Next"
          ) : (
            "Login Now"
          )}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type='checkbox' required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'>
              Already have an account?{" "}
              <span
                onClick={switchToLogin}
                className='text-sm text-violet-500 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Create an account{" "}
              <span
                onClick={switchToSignUp}
                className='text-sm text-violet-500 cursor-pointer'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
