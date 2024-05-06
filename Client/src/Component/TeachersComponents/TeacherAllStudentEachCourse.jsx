import React from 'react'

const TeacherAllStudentEachCourse = () => {
    return (
        <>
            <h1 className="text-4xl mb-1 font-semibold text-start">Enrolled Students</h1>



            <div class="relative overflow-x-auto  mt-8">
                <div class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">

                    <label for="table-search" class="sr-only">Search</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="table-search-users" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users" />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500  shadow-xl">
                        <thead class="text-xs text-gray-100 uppercase bg-orange-500 ">
                            <tr>

                                <th scope="col" class="px-6 py-3">
                                    Name
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Classes Taken
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Commission
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">

                                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <img class="w-10 h-10 rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3hMXsYcyINCaXkRBhVyEjHMQszmNStck2ELBWXKUYw&s" alt="Jese image" />
                                    <div class="ps-3">
                                        <div class="text-base font-semibold">Neil Sims</div>
                                        <div class="font-normal text-gray-500">989617271</div>
                                    </div>
                                </th>
                                <td class="px-6 py-4 text-center">
                                    12.5
                                </td>
                                <td class="px-6 py-4 text-center">
                                  ₹ 20,000

                                </td>

                            </tr>
                        

                        </tbody>
                      
                    </table>


                    <table class="w-full text-sm text-center rtl:text-center text-gray-500 dark:text-gray-400 shadow-xl rounded-md">
                        <thead class="text-xs text-gray-100 uppercase bg-orange-500 rounded-md ">
                            <tr>

                                <th scope="col" class="px-6 py-3">
                                    Month
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Amount Recieved
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Status
                                </th> 

                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b  ">

                                <th scope="row" class="px-6 py-4e text-bold">
                                    January
                                </th>
                                <td class="px-6 py-4">
                                   ₹ 13000
                                </td>

                                <td className='px-6 py-4 text-center'>
                                <svg class="h-8 w-8 text-green-600"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M7 12l5 5l10 -10" />  <path d="M2 12l5 5m5 -5l5 -5" /></svg>
                                </td>
                               

                            </tr>


                        </tbody>
                    </table>
                </div>

            </div>

        </>
    )
}

export default TeacherAllStudentEachCourse