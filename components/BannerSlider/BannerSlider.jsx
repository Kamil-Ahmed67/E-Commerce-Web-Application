'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import config from '@/config';
import { useFeatures } from '@/hooks/useFeatures';

const getMediaUrl = (url) => {
  if (!url) return '';

  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match?.[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const base = config.API_BASE_URL?.replace(/\/$/, '') || '';
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

export default function BannerSlider({ banners, autoPlayInterval = 4000, shopLink = '/shop' }) {
  // Use the features hook
  const { features, loading } = useFeatures();
  // Check if banner content is enabled
  const isVideoBannerContentEnabled =
    !loading && features?.enable_video_banner_content === true;
  if (!banners || banners.length === 0) {
    return (
      <div className="relative w-full min-h-[50vh] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  const hasVideo = banners.some((b) => b.videoUrl?.trim() && b.isActive);

  if (hasVideo) {
    const videoBanner = banners.find((b) => b.videoUrl?.trim() && b.isActive);

    const videoSrc = getMediaUrl(videoBanner.videoUrl);

    return (
      <div className="relative w-full h-[56.25vw] md:h-screen overflow-hidden">
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
        {!loading && isVideoBannerContentEnabled && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-4xl">
              <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                {videoBanner.title}
              </h1>
              <p className="text-sm sm:text-lg md:text-2xl mb-6">{videoBanner.description}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const slides = banners.flatMap((banner) => {
    let images = banner.bannerImage || [];
    if (images.length === 0) images = ['/images/hero1.png'];

    return images.map((image, idx) => ({
      id: banner.id,
      image,
      title: banner.title,
      description: banner.description,
      key: `${banner.id}-${idx}`,
    }));
  });

  return (
    <div className="relative w-full h-[56.25vw] md:h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: autoPlayInterval, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        slidesPerView={1}
        speed={1000}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key} className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title || 'Banner'}
              fill
              className="object-cover"
              priority
            />
            {slide.description && (
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="bg-black/50 text-center text-white px-6 py-4 max-w-3xl rounded-md">
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-medium">
                    {slide.description}
                  </p>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}