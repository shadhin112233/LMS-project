import React from 'react'
import { assets } from '../../assets/assets'
import SearchBox from './SearchBox'

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center bg-gradient-to-b from-cyan-100/70 to-white px-5 sm:px-8 pt-16 md:pt-24 pb-12">

      <h1 className="relative text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 max-w-5xl leading-tight">

        Build a brighter future with courses that{' '}

        <span className="text-blue-600 relative">
          match your ambitions

          <img
            src={assets.sketch}
            alt="sketch"
            className="hidden md:block absolute -bottom-4 right-0 w-28"
          />
        </span>

      </h1>

      <p className="mt-6 text-gray-600 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-xl md:max-w-3xl leading-relaxed">
        We bring together world-class instructors, interactive content,
        and a supportive community to help you achieve your personal
        and professional goals.
      </p>
      <SearchBox/>

      
    </section>
  )
}

export default Hero