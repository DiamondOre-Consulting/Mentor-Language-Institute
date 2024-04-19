import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from "axios";

const Login = () => {

    const [activeTab, setActiveTab] = useState(0);
    const [phone, setPhone] = useState("");

    const [username, adminSetusername] = useState("");
    const [password, SetPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // ADMIN LOGN
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        //   setLoading(true);
        setError(null);
        // Perform login logic here
        try {
            const response = await axios.post("http://localhost:7000/api/admin-confi/login-admin",
                {
                    username,
                    password
                });

            if (response.status === 200) {
                const token = response.data.token;
                // Store the token in local storage
                console.log(token)
                localStorage.setItem("token", token);
                console.log("Logged in successfully as Admin");
                navigate("/admin-dashboard");

            } else {
                console.log("Login failed");
                setError("Login Details Are Wrong!!");
                // Handle login error
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError("Login Details Are Wrong!!");
            // Handle error
        }
    };


    // STUDENT LOGIN

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setError(null);

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
    }

    const handleShowPassword = () => {
        return setShowPass(!showPass);
    };

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    return (
        <>
            <Navbar />
            <div className='-mt-10'>
                <div className="flex flex-col justify-center items-center">

                    <div className="py-4">
                        {activeTab === 0 && (
                            <section class="relative">

                                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                        <div className="flex space-x-4  ">
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(0)}
                                            >
                                                Student Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(1)}
                                            >
                                                Admin Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(2)}
                                            >
                                                Teacher Login
                                            </button>
                                        </div>
                                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                            <div className='flex justify-between items-center'>
                                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                                    Student
                                                </h1>


                                            </div>

                                            <form class="space-y-4 md:space-y-6" action="#" onSubmit={handleStudentLogin}>

                                                <div>
                                                    <input type="text" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>
                                                <div>
                                                    <label htmlFor="password" className="sr-only">
                                                        Password
                                                    </label>
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
                                                    <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                                </div>
                                                <div className='w-full'>
                                                    <button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button>
                                                </div>

                                                <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        {activeTab === 1 && (
                            <section class="relative">

                                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                        <div className="flex space-x-4  ">
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(0)}
                                            >
                                                Student Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(1)}
                                            >
                                                Admin Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(2)}
                                            >
                                                Teacher Login
                                            </button>
                                        </div>
                                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                            <div className='flex justify-between items-center'>
                                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                                    Admin
                                                </h1>


                                            </div>

                                            <form class="space-y-4 md:space-y-6" action="#" onSubmit={handleAdminLogin}>

                                                <div>
                                                    <input type="text" name="username" value={username} onChange={(e) => adminSetusername(e.target.value)} placeholder="Enter Username" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>
                                                <div>
                                                    <label htmlFor="password" className="sr-only">
                                                        Password
                                                    </label>
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
                                                    <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                                </div>
                                                <div className='w-full'>
                                                    <button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button>
                                                </div>

                                                <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                            </form>

                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        {activeTab === 2 && (
                            <section class="relative">

                                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                        <div className="flex space-x-4  ">
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(0)}
                                            >
                                                Student Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(1)}
                                            >
                                                Admin Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(2)}
                                            >
                                                Teacher Login
                                            </button>
                                        </div>
                                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                            <div className='flex justify-between items-center'>
                                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                                    Teacher
                                                </h1>


                                            </div>

                                            <form class="space-y-4 md:space-y-6" action="#">

                                                <div>
                                                    <input type="phone" name="phone" id="phone" placeholder="Enter Phone" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>
                                                <div>
                                                    <input type="password" name="password" id="password" placeholder="Enter Your password" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>


                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-start">
                                                        <div class="flex items-center h-5">
                                                            <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-900 dark:ring-offset-gray-800" required="" />
                                                        </div>
                                                        <div class="ml-3 text-sm">
                                                            <label for="remember" class="text-gray-500 dark:text-gray-300">Show password</label>
                                                        </div>
                                                    </div>
                                                    <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                                </div>
                                                <div className='w-full'>
                                                    <Link to={'/main-dashboard'}><button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button></Link>
                                                </div>

                                                <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                            </form>


                                        </div>
                                    </div>
                                </div>

                            </section>

                        )}
                        {error && (
                            <div className="flex items-center justify-center bg-red-300 p-4 rounded-md">
                                <p className="text-center text-sm text-red-500">{error}</p>
                            </div>
                        )}

                    </div>

                </div>
            </div>


            <Footer />
        </>
    )
}

export default Login