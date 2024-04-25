import React from 'react'

const TeacherProfile = ({teacherData}) => {

    console.log("teacherdata in profile",teacherData)
  return (
    <>
           <div class="w-full h-40">
                <img src="https://t4.ftcdn.net/jpg/03/16/92/61/360_F_316926143_cVdnI6bJPbhlo1yZVTJk0R0sjBx4vVnO.jpg" class="w-full h-full rounded-tl-lg rounded-tr-lg"/>
            </div>
            <div class="flex flex-col items-center -mt-20">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACUCAMAAAA5xjIqAAAAe1BMVEX///8wMzj8/PwAAAAtMDX29vb5+fkxMzYgJCorLjQoKzHw8PDq6uq5ubrl5eXt7e2LjI1qa20qKy18fX6xsbIVGiHLzMzc3d0fICKmp6gAAAuam5wIDxjW1tdOUFJCQ0UWFxoOEBRbXF47Oz1yc3TCw8MAAxNhZGZDSU33FdTkAAALMklEQVR4nO1c2WKyvBY1MZgBRQiGQWaQ4vs/4dlR27/1wyaAbc+F6+IbWomLzZ6zyWr1wgsvvPDCCy+88IKzjYtd6p+G9lxVVTuc/HRXxFtH/w7/NbnPcIpdFra8buqEMXEBY6ppalqG2a5w/prfFReR9X5bATlBKKWScEII13/o/xL986r1+8uH/1rA+z5omoQThIBXImlXVeUFVdVRyRjjl980TdDv/4zr9YujrMwZCBAxlVeBnx160FLXAbhbL9odMj+olGJaxiwvs+ivyALb/tQpAYJLjnmQRrE7IjnsxlE61GtGCBKqO/W/z1RjszvXkiDOSBVGBgvCUVgRUAgu1Hn3y9aGMd70Qw7aKPKz31t9u9P750bqK4Z+87uuLD7JhCL+dk7jCRel5RtoDROnCRctBF45GWKggqzcbSZeuivBYRCGst/SBVxUjbaWdjfn6t0ANknyqviFsIZXm4wLSpMu3c9bwU0rRakgINwfDxJuqzWgCbfzl9iGYGmcte5PyzYChUOs7GfHzmt8LhmiiYx+kCwsnVKtcP4CsV6x9Y/wfGT6DFqPkCUcAuthsUBggYMSVCb+M1iNwjnl8PDaJznJuE0Qak7uc1a7hxPWCNXBYhV4xzZQcO+nH/C48OBOsHYTznRYY9iHDUJJ8HSHC+71VEN6leFnrowzSB6T08QwaLGun1CisqdKAZbKamDrP5styAA1T18V1tU2mz13zd0aioEf4LrBPoSH9eGZaxaI0Dp8PlfAJsxh8eJ56rVvBUrKHwrlTquobJ/lZPAqTIiofixhjiuBWPis1Q5rSlBkK1fHi4siKmLP2ttHsPzxKWqLV15HaGOZcjh9diq7S2OjPGW95cNNj5R3T3hyEA3CBHJCqw+72ZkmTFw6HkRAlXbOLOjCEyvhK55ivztFJLFJCDxfKU4pegf8k9S1RTqJV1vIPOvD8ojjgvrb5J24L5v/iH6A52Vvkaan8CXVQnejA2KDxGBhK5mUdIQsoUJaJK3OIGieLSXr6ZSgMH5wM+TkX6Y3NINZHQtdLXlLuOr8hVF2Mt6xGyr0mCxNQnOKHTIkFtYNxZkQZXQqOsB/i8Q36q2XEFmZH+G3LBRS5pwobR6L9SrbxrQIXmWK1uZ7+gZbKfnZIFjQ6+P3VAEkN+pjDA/RykU+AoiM+YabxZuTQQk0hLkeAF3Kl9TmELSFMXvbCTNXxMXOtE7MkZTzufYKfKzpQ25gIVjwS4HBI+DVwGg9vzMO7uRovLpQBuu6QRk2FPCqP9L5qWJcEk5MDfgVOAw7skYv6nScl3OTrwOjRr+FV4LbkSXM+IWZQmxmXruB6jsxbgZt13ZcoSw0+qVIzK5Kt6WUrWf0Bbkt2cbYKfdawc9zXC1eRTncp/FzmaXKQoZgWgxrV9vM2djT8Q8JswaFVo7rQtZs6TuO6nkdj5YRi8LIJnxdAdmbCXFHRTuLbI6IRekV2MSvC0RgXq2U5G0OV29tI4vVyZqs1WoMreek4GDmyiKveKrOrlKF8jnba2CZR4tkeII3sDCd+Gjjgf5FIOnRolDszcnsDeY0AwJRbqXa98CtpDYJm2sfwWz2OgTh7fQYtof4ZdWHoXKkAh8BpzarlYKX0zuKcSUTC/MFm6jtyFrUcivtDsiMfmXREXNSpwNdnFjls4RZla6+It30gNsjbhf5HCvnRZjdhpd2LtOrhR4qUrvcMvqmv/EfWWQnrwPEzemOdods3TO2ES0L7ToCuxlksU6AbGOJuzaKllj5rStZPr1YmEAWqmADW5LY6iGQtchLl5DV25rfkrXflptJlhD7lGLjf9ftohO2JrUaTDcw7Q0mNHN89jBV5FNGINJ8juuK6LQKI+3YWOcb/EA3pYEFfnZGUIAINm0opGiPI6rAj+2kpitEsBldWq8iibHP9QU4rYQg9CNEUMqFqCYN1OCZuYELWVc18RrnEFS1EpepZC6SugoOU4dKznxO1rWyzGc/AV9mv/22Y0qxbvBnzHpjNiufXZ0kOs4ZDcKO6+73ruvM6bg7RySsEtM7ZDU6zuuOfP17EqI3y7z3DlBc2VS3X3G3gTGZMFS3b3P6ydv1rNpto+fS0/TQR94M3QsYMjcbxwC123mKhWy8Ig3Yen3Mc5Xn+XG9ZkE6jfKmktLcxh0D3GVn75+9g1+pRn6JC4TVdeUf7FssRUflNOf+jjQn1gmQF54F4/SfgAuBgYlz6Fmq70FYj2HcIVaW+T2O2mPyuFlPODu2kY026JrDvPk6in3LRGnxCAs/f5DDfNClrAkthry9Uohy3iYj9hOkzH7E76xac6rzjWx7EKxpQ/PhtZIoU+ev0LP8NmT1mwImc9Xb+LNG9AHblhPxOOJCAMApYXZUL3Rl+q3mupJyG70bh976fewPMFQztXUrWUPW/neOe9cs2GFcFTl63JzDq/3JUCfegyJ22j9W3FIY90wfA8PlVD4wMbzyhnoS1QvU8PA5RwJxu/mxcRyOj12tOyh7df3M9sFEFA7FsiG/fSXIg5C7sd5MuMOjDh0UfYIumn6HlC0ZFS32Lduy9yBIjQ7y4bBGbNlLFvFZ0GRMtKntvscIknREEYoEzd+/v0DvptKxItez6yCPQyYjpAY2b5/mMzYdGel5ueUk/3qPfwpYDD4W8W7x+xVpjkR7p/fGRpwJ7L7O2rZy2ejRFU4pyP3aHrWc3ngEge68bQpKUC4WLF5FnNPm6xD1kCzjCqL9ageFIoQ/4w1iPTspqs/eJl7P81qfsf7sYjaVQGJubvgV+46j+rOh2o8YPIb8XDj7isruScP/UU6oPHwoQrRcrro4+++pHyQhs6ZNRpGBw/5o8RrnT+3AbhOdYBRUklltmHHoCT7R3fyXt8zHvuOjvNtWCTXO/k1BXEmqXz3ViEzDsnbgtx19t2WIP/P1EgyRmxB2fd/QyZaE2g+uLLu0Gd1TQvlo9rEAB6gL2XUGFh9yuZAq5c21I745KUTmjvQ9AgYjo0idrv/u6UIbk/KWboSJ7d7+JLLAltAk2F/+4wVLVIEkgafPSFjtA0Wf6Qg+QafbariagpPJ2T5ByNuBAZ4O2zZDDZOhC+8G0eR88zhRNccrUH1aQHRtOnsloyT/tjhfglRKJNju9jpr1rHJyRdNuvc3TMFkEf+5t8UxBEYBeb5/8+CxzycaGpP+rT/n+OBexIzd+gkAPwAmEdx8OC6Co7WlUcrWQXHL3uIAajhGf/igFq8FdrL+OFPDCymzEq9gNHzPuJ0UruGqXfjijxk4FALsYvjIkuI0YErSbwdlhGLB7VwU0IFo0GmcDJ2fP5Vjs6P6EXYfclq5UVau80dlGRH5usoi9707uw07CIAJnXpSyhzoPc8hAeEyfnnj78pg46VBR4RgQu/cSn2clOT6HCwhuyC97thcUsKtTxkhgtm8D/ck7NqaIKJEFn8SD453WXgaynPXAdmuKofT3VldmzgTimhtndsynoVtxhWkI6oK+6tob74XO/vLa7dRVMTx/rp9+77riPuwgntEimRPO9DBEp6vj2kiTJSZlVF7WSmZPtdJhT/uBO4B0orDSkEI42pdpsX2G3PZbIu0XWuPoR9F/EcnzhVZpQ+KQiJXLahnPGI0jlbkluXi4haq7MlptjUuxr1r35TQ6pAkpCoDoBwV3h7gxdEuDYOyIgkkAcBUrdvd9q8PmfOy4cwSvWlLuGAqf1vf8JYrJgj8XB81Vw12qv3jwMXBbwlQGwkLBOjL1j8Ufy3TT8D7uM8Gfjwec6XYBUrlx3Ujh6yP/+7Yvu+w8Yo+zfwQ4GfpvPmIX8HDV2b/L8X6wgsvvPDCCy+M438YVrZMAeP1RwAAAABJRU5ErkJggg==" class="w-40 border-4 border-white rounded-full"/>
                <div class="flex items-center space-x-2 mt-2">
                    <p class="text-2xl">{teacherData.name}</p>
                    <span class="bg-blue-500 rounded-full p-1" title="Verified">
                        <svg xmlns="http://www.w3.org/2000/svg" class="text-gray-100 h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </span>
                </div>
                
            </div>
            {/* <div class="flex-1 flex flex-col items-center lg:items-end justify-end px-8 mt-2">
                <div class="flex items-center space-x-4 mt-2">
                    <button class="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                        </svg>
                        <span>Connect</span>
                    </button>
                    <button class="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Message</span>
                    </button>
                </div>
            </div> */}
      

        <div class="my-4 flex flex-col 2xl:flex-row space-y-4 2xl:space-y-0 2xl:space-x-4">
            <div class="w-full flex flex-col 2xl:w-1/3">
                <div class="flex-1 bg-white rounded-lg shadow-xl p-8">
                    <h4 class="text-xl text-gray-900 font-bold">Personal Info</h4>
                    <ul class="mt-2 text-gray-700">
                        <li class="flex border-y py-2">
                            <span class="font-bold w-24">Full name:</span>
                            <span class="text-gray-700">{teacherData.name}</span>
                        </li>

                       

                        <li class="flex border-b py-2">
                            <span class="font-bold w-24">Mobile:</span>
                            <span class="text-gray-700">{teacherData.phone}</span>
                        </li>
                       
                        <li class="flex border-b py-2">
                            <span class="font-bold w-24">Joined:</span>
                            <span class="text-gray-700">10 Jan 2022 (25 days ago)</span>
                        </li>
                        
                        
                        <li class="flex border-b py-2">
                            <span class="font-bold w-24">Location:</span>
                            <span class="text-gray-700">New York, US</span>
                        </li>
                        <li class="flex border-b py-2">
                            <span class="font-bold w-24">Languages:</span>
                            <span class="text-gray-700">English, Spanish</span>
                        </li>
                        <li class="flex items-center border-b py-2 space-x-2">
                            <span class="font-bold w-24">Elsewhere:</span>
                            <a href="#" title="Facebook">
                                <svg class="w-5 h-5" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 506.86 506.86"><defs></defs><path class="cls-1" d="M506.86,253.43C506.86,113.46,393.39,0,253.43,0S0,113.46,0,253.43C0,379.92,92.68,484.77,213.83,503.78V326.69H149.48V253.43h64.35V197.6c0-63.52,37.84-98.6,95.72-98.6,27.73,0,56.73,5,56.73,5v62.36H334.33c-31.49,0-41.3,19.54-41.3,39.58v47.54h70.28l-11.23,73.26H293V503.78C414.18,484.77,506.86,379.92,506.86,253.43Z"></path><path class="cls-2" d="M352.08,326.69l11.23-73.26H293V205.89c0-20,9.81-39.58,41.3-39.58h31.95V104s-29-5-56.73-5c-57.88,0-95.72,35.08-95.72,98.6v55.83H149.48v73.26h64.35V503.78a256.11,256.11,0,0,0,79.2,0V326.69Z"></path></svg>
                            </a>
                            <a href="#" title="Twitter">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333333 333333" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><path d="M166667 0c92048 0 166667 74619 166667 166667s-74619 166667-166667 166667S0 258715 0 166667 74619 0 166667 0zm90493 110539c-6654 2976-13822 4953-21307 5835 7669-4593 13533-11870 16333-20535-7168 4239-15133 7348-23574 9011-6787-7211-16426-11694-27105-11694-20504 0-37104 16610-37104 37101 0 2893 320 5722 949 8450-30852-1564-58204-16333-76513-38806-3285 5666-5022 12109-5022 18661v4c0 12866 6532 24246 16500 30882-6083-180-11804-1876-16828-4626v464c0 17993 12789 33007 29783 36400-3113 845-6400 1313-9786 1313-2398 0-4709-247-7007-665 4746 14736 18448 25478 34673 25791-12722 9967-28700 15902-46120 15902-3006 0-5935-184-8860-534 16466 10565 35972 16684 56928 16684 68271 0 105636-56577 105636-105632 0-1630-36-3209-104-4806 7251-5187 13538-11733 18514-19185l17-17-3 2z" fill="#1da1f2"></path></svg>
                            </a>
                            <a href="#" title="LinkedIn">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333333 333333" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><path d="M166667 0c92048 0 166667 74619 166667 166667s-74619 166667-166667 166667S0 258715 0 166667 74619 0 166667 0zm-18220 138885h28897v14814l418 1c4024-7220 13865-14814 28538-14814 30514-1 36157 18989 36157 43691v50320l-30136 1v-44607c0-10634-221-24322-15670-24322-15691 0-18096 11575-18096 23548v45382h-30109v-94013zm-20892-26114c0 8650-7020 15670-15670 15670s-15672-7020-15672-15670 7022-15670 15672-15670 15670 7020 15670 15670zm-31342 26114h31342v94013H96213v-94013z" fill="#0077b5"></path></svg>
                            </a>
                            <a href="#" title="Github">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="0" height="0" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 640 640"><path d="M319.988 7.973C143.293 7.973 0 151.242 0 327.96c0 141.392 91.678 261.298 218.826 303.63 16.004 2.964 21.886-6.957 21.886-15.414 0-7.63-.319-32.835-.449-59.552-89.032 19.359-107.8-37.772-107.8-37.772-14.552-36.993-35.529-46.831-35.529-46.831-29.032-19.879 2.209-19.442 2.209-19.442 32.126 2.245 49.04 32.954 49.04 32.954 28.56 48.922 74.883 34.76 93.131 26.598 2.882-20.681 11.15-34.807 20.315-42.803-71.08-8.067-145.797-35.516-145.797-158.14 0-34.926 12.52-63.485 32.965-85.88-3.33-8.078-14.291-40.606 3.083-84.674 0 0 26.87-8.61 88.029 32.8 25.512-7.075 52.878-10.642 80.056-10.76 27.2.118 54.614 3.673 80.162 10.76 61.076-41.386 87.922-32.8 87.922-32.8 17.398 44.08 6.485 76.631 3.154 84.675 20.516 22.394 32.93 50.953 32.93 85.879 0 122.907-74.883 149.93-146.117 157.856 11.481 9.921 21.733 29.398 21.733 59.233 0 42.792-.366 77.28-.366 87.804 0 8.516 5.764 18.473 21.992 15.354 127.076-42.354 218.637-162.274 218.637-303.582 0-176.695-143.269-319.988-320-319.988l-.023.107z"></path></svg>
                            </a>
                        </li>
                    </ul>
                </div>
                {/* <div class="flex-1 bg-white rounded-lg shadow-xl mt-4 p-8">
                    <h4 class="text-xl text-gray-900 font-bold">Activity log</h4>
                    <div class="relative px-4">
                        <div class="absolute h-full border border-dashed border-opacity-20 border-secondary"></div>

                        <!-- start::Timeline item -->
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">Profile informations changed.</p>
                                <p class="text-xs text-gray-500">3 min ago</p>
                            </div>
                        </div>
                        <!-- end::Timeline item -->

                        <!-- start::Timeline item -->
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">
                                    Connected with <a href="#" class="text-blue-600 font-bold">Colby Covington</a>.</p>
                                <p class="text-xs text-gray-500">15 min ago</p>
                            </div>
                        </div>
                    <!-- end::Timeline item -->

                        <!-- start::Timeline item -->
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">Invoice <a href="#" class="text-blue-600 font-bold">#4563</a> was created.</p>
                                <p class="text-xs text-gray-500">57 min ago</p>
                            </div>
                        </div>
                       
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">
                                    Message received from <a href="#" class="text-blue-600 font-bold">Cecilia Hendric</a>.</p>
                                <p class="text-xs text-gray-500">1 hour ago</p>
                            </div>
                        </div>
                       
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">New order received <a href="#" class="text-blue-600 font-bold">#OR9653</a>.</p>
                                <p class="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <!-- end::Timeline item -->

                        <!-- start::Timeline item -->
                        <div class="flex items-center w-full my-6 -ml-1.5">
                            <div class="w-1/12 z-10">
                                <div class="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div class="w-11/12">
                                <p class="text-sm">
                                    Message received from <a href="#" class="text-blue-600 font-bold">Jane Stillman</a>.</p>
                                <p class="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                       
                    </div>
                </div> */}
            </div>
           
        </div>
   </>
  )
}

export default TeacherProfile