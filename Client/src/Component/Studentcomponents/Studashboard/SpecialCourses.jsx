import React from 'react'

const SpecialCourses = () => {
    return (
        <>
            <div>

                <div className='mt-24'>
                    <div className="bg-white py-4 sm:py-6">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto w-full lg:mx-0">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    Special Courses
                                </h2>
                                
                            </div>

                            <div className='grid grid-cols-5 gap-2 gap-y-4 mt-10 mb-0'>

                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://motif.com.np/wp-content/uploads/2023/07/ielts-1024x576-1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://res.cloudinary.com/connecttoqadir/image/upload/v1667500113/edifyBlog/i3lpqiwlqfju4mie5f46.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://t4.ftcdn.net/jpg/03/23/32/63/360_F_323326385_eQMjx0LpXsMj51QQIyYiw9APERlwcrQ6.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://highlandrambler.org/wp-content/uploads/2019/11/AP-College-Board.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://www.kopykitab.com/blog/wp-content/uploads/2022/08/cuet-sayaiita-common-university-entrance-test_1648382456.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border  border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://3.imimg.com/data3/XE/HG/GLADMIN-13193557/rr-500x500.png')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                {/* <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: "url('https://cdn3.vectorstock.com/i/1000x1000/54/02/psychology-science-background-psychologist-online-vector-38745402.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div> */}
                                <div className='border border-1 h-60 rounded-md col-span-3' style={{ backgroundImage: "url('https://www.english-pro.in/wp-content/uploads/2021/07/personality-development-course-in-chandigarh-1080x400.jpg')", backgroundSize: "contain", backgroundPosition: "center" }}></div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default SpecialCourses