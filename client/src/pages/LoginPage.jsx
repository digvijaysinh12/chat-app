import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css'; // External CSS file

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
    <div className="login-container">
      <form onSubmit={onSubmitHandler} className="login-form">
<h2 className="form-title">
  {currState}
  {currState === "Sign up" && isDataSubmitted && (
    <img
      onClick={() => setIsDataSubmitted(false)}
      src={assets.arrow_icon}
      alt="Back"
      className="back-arrow"
    />
  )}
</h2>


        {currState === "Sign up" && !isDataSubmitted && (
          <>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type='text'
              placeholder='Full Name'
              required
              className="form-input"
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type='email'
              placeholder='Email Address'
              required
              className="form-input"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password'
              placeholder='Password'
              required
              className="form-input"
            />
            {otpSent && !otpVerified && (
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="form-input"
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
            className="form-textarea"
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
              className="form-input"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password'
              placeholder='Password'
              required
              className="form-input"
            />
          </>
        )}

        <button
          type='submit'
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : currState === "Sign up" ? (
            !otpSent ? "Send OTP" :
              !otpVerified ? "Verify OTP" :
                isDataSubmitted ? "Submit Bio" : "Next"
          ) : (
            "Login Now"
          )}
        </button>

        <div className="checkbox-container">
          <input type='checkbox' required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="switch-text">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span onClick={switchToLogin} className="switch-link">
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create an account{" "}
              <span onClick={switchToSignUp} className="switch-link">
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
