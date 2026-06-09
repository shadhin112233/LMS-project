import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white w-full pt-12 pb-8 px-6 sm:px-12 md:px-24 lg:px-36 border-t border-gray-800'>
      <div className='max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-10 md:gap-24 items-start'>
        
        {/* Left Column: Logo & Description */}
        <div className='flex flex-col gap-4 text-left w-full md:max-w-sm'>
          <img 
            src={assets.logo_dark || assets.logo} 
            alt="Edemy Logo" 
            className='w-24 sm:w-32 brightness-0 invert' 
          />
          <p className='text-xs sm:text-sm text-gray-400 leading-relaxed font-normal'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
        </div>

        {/* Middle Column: Links */}
        <div className='flex flex-col gap-3 text-left w-full'>
          <h2 className='text-sm sm:text-base font-semibold tracking-wide text-gray-200'>Company</h2>
          <ul className='flex flex-col gap-2 text-xs sm:text-sm text-gray-400 font-normal'>
            <li><a href="#" className='hover:text-blue-500 transition-colors inline-block py-1'>Home</a></li>
            <li><a href="#" className='hover:text-blue-500 transition-colors inline-block py-1'>About us</a></li>
            <li><a href="#" className='hover:text-blue-500 transition-colors inline-block py-1'>Contact us</a></li>
            <li><a href="#" className='hover:text-blue-500 transition-colors inline-block py-1'>Privacy policy</a></li>
          </ul>
        </div>

        {/* Right Column: Newsletter Subscription */}
        <div className='flex flex-col gap-4 text-left w-full'>
          <h2 className='text-sm sm:text-base font-semibold tracking-wide text-gray-200'>Subscribe to our newsletter</h2>
          <p className='text-xs sm:text-sm text-gray-400 font-normal leading-relaxed'>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 w-full max-w-md'>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className='bg-gray-800 text-white placeholder-gray-500 text-xs sm:text-sm px-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow border border-gray-700 w-full'
              required
            />
            <button 
              type="submit" 
              className='bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-md whitespace-nowrap w-full sm:w-auto text-center'
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Copyright Section */}
      <div className='max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-[11px] sm:text-xs text-gray-500 font-normal tracking-wide'>
        Copyright 2024 © Edemy. All Right Reserved.
      </div>
    </footer>
  )
}

export default Footer