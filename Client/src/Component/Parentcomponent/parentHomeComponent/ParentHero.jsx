import React from 'react'

const ParentHero = () => {
    return (
        <>
            <div className='px-14 pt-10 bg-gray-50'>
                <div>
                    <p className='text-3xl font-bold'>Hello Hya <span className='text-orange-400'>Welcome back</span></p>
                </div>
                <div className='mt-6 '>
                    <h1 className='text-5xl font-bold text-orange-400'>Your Ward</h1>
                    <div class="flex items-center gap-4 mt-10">
                        <div className=''>
                            <img class="w-20 h-20 rounded-full" src="https://cdn4.sharechat.com/img_907710_35cec5f5_1681916904360_sc.jpg?tenant=sc&referrer=pwa-sharechat-service&f=360_sc.jpg" alt="" />
                            <div class="font-medium dark:text-white">
                                <div>Jese Leos</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Joined in August 2014</div>
                            </div>

                        </div>

                        <div className='mx-4'>
                            <img class="w-20 h-20 rounded-full" src="https://cdn4.sharechat.com/img_907710_35cec5f5_1681916904360_sc.jpg?tenant=sc&referrer=pwa-sharechat-service&f=360_sc.jpg" alt="" />
                            <div class="font-medium dark:text-white">
                                <div>Jese Leos</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Joined in August 2014</div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#F9FAFB" fill-opacity="1" d="M0,128L34.3,144C68.6,160,137,192,206,186.7C274.3,181,343,139,411,117.3C480,96,549,96,617,122.7C685.7,149,754,203,823,202.7C891.4,203,960,149,1029,128C1097.1,107,1166,117,1234,128C1302.9,139,1371,149,1406,154.7L1440,160L1440,0L1405.7,0C1371.4,0,1303,0,1234,0C1165.7,0,1097,0,1029,0C960,0,891,0,823,0C754.3,0,686,0,617,0C548.6,0,480,0,411,0C342.9,0,274,0,206,0C137.1,0,69,0,34,0L0,0Z"></path></svg>

        </>
    )
}

export default ParentHero