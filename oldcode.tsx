// const TestimonialsSection = () => {
//   return (
//     <section className="py-12 bg-gray-800">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold text-center text-white mb-8">Testimonials</h2>
//         <Swiper
//           effect={'coverflow'}
//           grabCursor={true}
//           centeredSlides={true}
//           slidesPerView={'auto'}
//           loop={true}
//           breakpoints={{
//             640: {
//               slidesPerView: 1,
//             },
//             768: {
//               slidesPerView: 2,
//             },
//             1024: {
//               slidesPerView: 3,
//             },
//           }}
//           coverflowEffect={{
//             rotate: 50,
//             stretch: 0,
//             depth: 100,
//             modifier: 1,
//             slideShadows: true,
//           }}
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false
//           }}
//           pagination={false}
//           modules={[EffectCoverflow, Pagination, Autoplay]}
//           className="mySwiper"
//         >
//           {testimonials.map((testimonial, index) => (
//             <SwiperSlide key={index}>
//               <div className="bg-white p-6 shadow-2xl rounded text-center">
//                 <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-4"/>
//                 <p className="text-xl font-semibold mb-4">"{testimonial.feedback}"</p>
//                 <p className="text-gray-600">- {testimonial.name}</p>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// };

// export default TestimonialsSection;