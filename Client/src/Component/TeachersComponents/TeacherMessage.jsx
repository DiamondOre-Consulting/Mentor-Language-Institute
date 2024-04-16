import React from 'react'

const TeacherMessage = () => {
  return (
    <>
          <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <div className="lg:w-1/3 bg-white border-r border-gray-300">
          <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-orange-500 text-white">
            <h1 className="text-2xl font-semibold">Students</h1>
            <div className="relative">
              <button id="menuButton" className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
              </button>
           
              <div id="menuDropdown" class="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg hidden">
                <ul class="py-2 px-3">
                  <li><a href="#" class="block px-4 py-2 text-gray-800 hover:text-gray-400">Option 1</a></li>
                  <li><a href="#" class="block px-4 py-2 text-gray-800 hover:text-gray-400">Option 2</a></li>
                
                </ul>
              </div>
            </div>
          </header>
        
          <div class="overflow-y-auto lg:h-screen p-3 lg:mb-9 pb-20">
            <div class="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <div class="w-12 h-12 bg-gray-300 rounded-full mr-3">
                <img src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" class="w-12 h-12 rounded-full"/>
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold">Alice</h2>
                <p class="text-gray-600">Hoorayy!!</p>
              </div>
            </div>
            
            <div class="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <div class="w-12 h-12 bg-gray-300 rounded-full mr-3">
                <img src="https://placehold.co/200x/ad922e/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" class="w-12 h-12 rounded-full"/>
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold">Martin</h2>
                <p class="text-gray-600">That pizza place was amazing! We should go again sometime. 🍕</p>
              </div>
            </div>
            
            <div class="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <div class="w-12 h-12 bg-gray-300 rounded-full mr-3">
                <img src="https://placehold.co/200x/2e83ad/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" class="w-12 h-12 rounded-full"/>
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold">Charlie</h2>
                <p class="text-gray-600">Hey, do you have any recommendations for a good movie to watch?</p>
              </div>
            </div>
            
            
            
           

            
            
          </div>
        </div>
        
       
        <div class="flex-1">
          
            <header class="bg-white p-4 text-gray-700">
                <h1 class="text-2xl font-semibold">Alice</h1>
            </header>
            
           
            <div class="h-screen overflow-y-auto p-4 pb-36">
              
           
               <div class="flex justify-end mb-4 cursor-pointer">
                 <div class="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
                   <p>Of course! I'll drop it off at your place tomorrow.</p>
                 </div>
                 <div class="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                   <img src="https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="My Avatar" class="w-8 h-8 rounded-full"/>
                 </div>
               </div>
               
             
               <div class="flex mb-4 cursor-pointer">
                 <div class="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                   <img src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" class="w-8 h-8 rounded-full"/>
                 </div>
                 <div class="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                   <p class="text-gray-700">Thanks, you're the best!</p>
                 </div>
               </div>
             
               <div class="flex justify-end mb-4 cursor-pointer">
                 <div class="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
                   <p>Anytime! Let me know how you like it. 😊</p>
                 </div>
                 <div class="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                   <img src="https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="My Avatar" class="w-8 h-8 rounded-full"/>
                 </div>
               </div>
               
             
               <div class="flex mb-4 cursor-pointer">
                 <div class="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                   <img src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato" alt="User Avatar" class="w-8 h-8 rounded-full"/>
                 </div>
                 <div class="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                   <p class="text-gray-700">So, pizza next week, right?</p>
                 </div>
               </div>
               
               

               
            </div>
            
            
            <footer className="bg-white border-t border-gray-300 p-4 lg:sticky bottom-10">
            <div className="flex items-center">
              <input type="text" placeholder="Type a message..." className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500" />
              <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">Send</button>
            </div>
          </footer>
        </div>
    </div>
    </>
  )
}

export default TeacherMessage