import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-4 pt-10 pb-24 px-8 md:px-0 text-center'>
      <h1 className='text-xl sm:text-4xl text-gray-800 font-semibold max-w-xl mx-auto leading-tight'>
        Learn anything, anytime, anywhere
      </h1>
      <p className='text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed'>
        Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur commodo do ea.
      </p>
      
      <div className='flex items-center font-medium gap-6 mt-4'>
        <button className='px-10 py-3 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors'>
          Get started
        </button>
        <button className='flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors group'>
          Learn more 
          <img 
            src={assets.arrow_icon} 
            alt="arrow_icon" 
            className='w-3 h-3 group-hover:translate-x-1 transition-transform'
          />
        </button>
      </div>
    </div>
  )
}

export default CallToAction