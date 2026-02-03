import React from 'react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import ReviewCard from './ReviewCard';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const Reviews = () => {

    const axiosSecure = useAxiosSecure();

    const {
        data: reviews = [],   
    } = useQuery({
        queryKey: ['getReview'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/getReview`);
            return res.data;
        }
    });


    return (
        <div className='mx-10 mb-10'>
            <div className='text-center mr-7 mb-10'>
                <h3 className="text-3xl text-center font-bold my-8">Review</h3>
                <p>Our Public Infrastructure Issue Reporting System provides a modern digital solution for citizens to report and track real-world infrastructure problems efficiently. By bridging the gap between community concerns and municipal services, we enable faster response times, transparent tracking, and collaborative problem-solving that transforms urban living experiences.</p>
            </div>

            <Swiper
                loop={true}
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={3}
                coverflowEffect={{
                    rotate: 30,
                    stretch: '50%',
                    depth: 200,
                    modifier: 1,
                    scale: 0.75,
                    slideShadows: true,
                }}
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                }}
                pagination={true}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="mySwiper"
            >
                {
                    reviews.map(review => <SwiperSlide key={review.id}>
                        <ReviewCard review={review}></ReviewCard>
                    </SwiperSlide>)
                }
            </Swiper>

        </div>
    );
};

export default Reviews;