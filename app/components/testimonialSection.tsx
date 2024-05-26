'use client'

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';

const testimonials = [
  { name: 'John Doe', feedback: 'Excellent service! Highly recommend.', image: 'https://swiperjs.com/demos/images/nature-1.jpg' },
  { name: 'Jane Smith', feedback: 'Professional and efficient. Great work!', image: 'https://swiperjs.com/demos/images/nature-2.jpg' },
  { name: 'Bob Johnson', feedback: 'They restored my home perfectly. Thank you!', image: 'https://swiperjs.com/demos/images/nature-3.jpg' },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white p-6 shadow rounded text-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-4"/>
                <p className="text-xl font-semibold mb-4">"{testimonial.feedback}"</p>
                <p className="text-gray-600">- {testimonial.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
