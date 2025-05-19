import React, { useState } from 'react'
import assets from '../assets/assets'

const LoginPage = () => {

  const [currState,serCurrState] = useState("Sign up");
  const [fullName,setFullName] = useState("")
  const [email,setEmail] = useState("")
  const [passwor,setPassword] = useState("")
  const [bio,setBio] = useState("")
  const [isDataSubmitted,setIsDataSubmitted] = useState(false);

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* _________________________Left________________________________ */}
      <img src={assets.logo}  alt='' className='w-[min(30vw,250px)]'/>
      {/* _________________________Right________________________________ */}
      <form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          <img src={assets.arrow_icon} alt="w-5 cursor-pointer"/>
          </h2>
          {currState === "Sign up" && !isDataSubmitted &&(
              <input onChange={(e) => setFullName(e.target.value)} value={fullName} 
              type='text' className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required/>
          )}
          {!isDataSubmitted && (
            <>
              <input onChange={(e) => setEmail(e.target.value)} value={email}
               type='email' placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'/>
              <input onChange={(e) => setPassword(e.target.value)} value={passwor}
               type='password' placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'/>
        </>
        )}

        {
          currState === "Sign up" && !isDataSubmitted && (
            <textarea onChnge={(e) => setBio} 
            rows={4} className='p-2 border border-gray-500 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-indigo-500' 
            placeholder='provide a short bio...' required></textarea>
          )
        }
      </form>

    </div>
  )
}

export default LoginPage
