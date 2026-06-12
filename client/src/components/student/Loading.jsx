import React from 'react'

const Loading = () => {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-16 h-16 sm:w-20 sm:h-20 aspect-square border-4 border-gray-300 border-t-blue-400 rounded-full animate-spin'></div>
    </div>
  )
}

export default Loading