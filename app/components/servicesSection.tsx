'use client'

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-flip';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { EffectFlip, Pagination, Navigation } from 'swiper/modules';

const services = [
  { 
    title: "Water Damage Restoration", 
    description: "Quick and efficient water damage repair services.",
    images: [
      "https://swiperjs.com/demos/images/nature-1.jpg",
      "https://swiperjs.com/demos/images/nature-2.jpg"
    ]
  },
  { 
    title: "Fire Damage Restoration", 
    description: "Comprehensive fire damage restoration and cleanup.",
    images: [
      "https://swiperjs.com/demos/images/nature-3.jpg",
      "https://swiperjs.com/demos/images/nature-4.jpg"
    ]
  },
  { 
    title: "Mold Remediation", 
    description: "Safe and effective mold removal services.",
    images: [
      "https://swiperjs.com/demos/images/nature-5.jpg",
      "https://swiperjs.com/demos/images/nature-6.jpg"
    ]
  },
  { 
    title: "General Repairs", 
    description: "Quality repairs for all parts of your home.",
    images: [
      "https://swiperjs.com/demos/images/nature-1.jpg",
      "https://swiperjs.com/demos/images/nature-2.jpg"
    ]
  }
];

const ServicesSection = () => (
  <section className='py-12 bg-gray-100'>
    <div className='container mx-auto px-4'>
      <h2 className='text-3xl font-bold text-center mb-8'>Our Services</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        {services.map((service, index) => (
          <div key={index} className='bg-white p-6 shadow rounded text-center'>
            <Swiper
              effect={'flip'}
              grabCursor={true}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectFlip, Pagination, Navigation]}
              className="mySwiper mb-4"
            >
              {service.images.map((image, imgIndex) => (
                <SwiperSlide key={imgIndex}>
                  <img src={image} alt={`Slide ${imgIndex + 1}`} className="w-full h-64 object-cover rounded" />
                </SwiperSlide>
              ))}
            </Swiper>
            <h3 className='text-xl font-semibold mb-2'>{service.title}</h3>
            <p className='text-gray-600'>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;

