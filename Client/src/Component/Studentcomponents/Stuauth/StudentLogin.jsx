import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;


const StudentLogin = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, SetPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:7000/api/students/login",
                {
                    phone,
                    password
                });

            if (response.status === 200) {
                const token = response.data.token;
                // Store the token in local storage
                console.log(token)
                localStorage.setItem("token", token);
                console.log("Logged in successfully as student");
                navigate("/main-dashboard");

            } else {
                console.log("Login failed");
                setError("Login Details Are Wrong!!");
                // Handle login error
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    console.log("invalid phone no");
                    setError("Invalid Phone No");
                }
                else if (status === 402) {
                    console.log("invalid passward")
                    setError("Invalid password No");
                }
                else {
                    console.error("Error adding Student:", status);
                    setError("Login Details Are Wrong!!");
                }
            }
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <>
            <Navbar />
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                </div>
            )}
            <div class="mt-20 md:mt-12 flex items-center justify-center">
                <div class="bg-white dark:bg-gray-900 shadow-xl rounded-lg px-8 py-6 w-3/4 md:max-w-md">
                    <h1 class="text-3xl font-bold text-center mb-1 dark:text-gray-200">LOGIN</h1>
                    <div className='md:w-96 h-0.5 rounded bg-orange-500 mb-4'></div>
                    <form onSubmit={handleStudentLogin} className=''>
                        <div class="mb-4">
                            <label for="phone" class="block text-sm font-medium text-gray-700  mb-2">Phone</label>
                            <input type="text" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} class="shadow-sm rounded-md w-full px-3 py-2 border border-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Your Phone No" required />
                        </div>
                        <div class="mb-4">
                            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-lg border-1 p-4 pe-12 text-sm shadow-sm"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => SetPassword(e.target.value)}
                                />

                            </div>

                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input aria-describedby="remember" id="check"
                                        type="checkbox"
                                        value={showPassword}
                                        onChange={() =>
                                            setShowPassword((prev) => !prev)
                                        } class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-900 dark:ring-offset-gray-800" required="" />
                                </div>
                                <div class="ml-3 text-sm">
                                    <label for="remember" class="text-gray-500 dark:text-gray-300">Show password</label>
                                </div>
                            </div>

                        </div>
                        <div class="flex items-center justify-between mb-4">

                            <Link to='/'
                                class="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Create
                                Account</Link>
                        </div>
                        <div className='w-full'>
                            <button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button>
                        </div>

                    </form>

                    {error && (
                        <div className="flex items-center justify-center bg-red-300 p-4 rounded-md">
                            <p className="text-center text-sm text-red-500">{error}</p>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </>
    )
}

export default StudentLogin