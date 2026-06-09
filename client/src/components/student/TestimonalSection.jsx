import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    <div className='pb-14 px-4 py-12 flex flex-col items-center justify-center w-full bg-gray-50/50'>
      <div className='text-center max-w-2xl mx-auto mb-10 flex flex-col items-center justify-center'>
        <h2 className='text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl relative inline-block pb-2 after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-1 after:bg-blue-600 after:rounded-full text-center'>
          Testimonials
        </h2>
        <p className='text-base text-gray-600 mt-4 leading-relaxed font-normal px-2 text-center'>
          Hear from our learners as they share their journeys of transformation, success, and how our platform has made a difference in their lives.
        </p>
      </div>

      <div className='w-full flex justify-center items-center px-4'>
        <div className='flex flex-wrap items-stretch justify-center gap-6 w-full max-w-6xl'>
          {dummyTestimonial.map((testimonial, index) => (
            <div key={index} className='text-xs text-left border border-gray-200/80 pb-5 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] max-w-sm transform hover:-translate-y-1'>
              
              <div className='flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100'>
                <img className='h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm' src={testimonial.image} alt={testimonial.name} />
                <div>
                  <h1 className='text-sm font-semibold text-gray-800 tracking-wide'>{testimonial.name}</h1>
                  <p className='text-gray-500 text-[11px] font-medium mt-0.5'>{testimonial.role}</p>
                </div>
              </div>

              <div className='p-4 pb-2 flex-grow flex flex-col justify-between'>
                <div>
                  <div className='flex gap-0.5 mb-3 bg-yellow-50/60 p-1 rounded-md inline-flex'>
                    {[...Array(5)].map((_, i) => (
                      <img 
                        key={i} 
                        className='h-3.5 w-3.5' 
                        src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank} 
                        alt="star" 
                      />
                    ))}
                  </div>
                  
                  <p className='text-gray-600 line-clamp-4 mb-4 leading-relaxed font-normal text-[12px] italic'>
                    "{testimonial.feedback}"
                  </p>
                </div>
                
                <div className='pt-2 border-t border-gray-50'>
                  <a 
                    href="#"
                    className='text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1 transition-colors group'
                  >
                    Read More <span className='group-hover:translate-x-1 transition-transform'>→</span>
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection