import React, { useState, useEffect, useCallback } from 'react';
import type { HomePageProps } from '../types';

const HomePage: React.FC<HomePageProps> = () => {
  // Mock image data for the carousel
  const carouselImages = [
    { src: "https://placehold.co/1200x400/AEC6CF/FFFFFF?text=Project+Launch", alt: "Project Launch" },
    { src: "https://placehold.co/1200x400/98AFC7/FFFFFF?text=Community+Outreach", alt: "Community Outreach" },
    { src: "https://placehold.co/1200x400/6D7B8D/FFFFFF?text=Impact+Stories", alt: "Impact Stories" },
    { src: "https://placehold.co/1200x400/4682B4/FFFFFF?text=New+Partnerships", alt: "New Partnerships" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [carouselImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  }, [carouselImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality for the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 font-sans antialiased text-gray-800">
      {/* Hero Section */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto border border-blue-100 mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 sm:mb-6 leading-tight tracking-tight">
          Compassionate Care, Connected Anywhere.
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto">
          Providing essential medical consultations and support to underserved communities,
          bridging distances with the power of telemedicine.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() => console.log('Learn More clicked')}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Learn More
          </button>
          <button
            onClick={() => console.log('Support Us clicked')}
            className="w-full sm:w-auto px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Support Our Mission
          </button>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative w-full max-w-6xl mx-auto mb-12 sm:mb-16 rounded-2xl overflow-hidden shadow-3xl border border-blue-100">
        <div className="w-full aspect-video flex transition-transform duration-500 ease-in-out"
             style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {carouselImages.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className="w-full flex-shrink-0 object-cover"
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous image"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next image"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? 'bg-white' : 'bg-gray-400 bg-opacity-75'
              } hover:bg-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto text-center border border-blue-100 mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4 sm:mb-6">About Us</h2>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Optimo is a non-profit organization dedicated to revolutionizing healthcare access for underserved populations globally. We leverage cutting-edge telemedicine technology to connect patients in remote or disadvantaged areas with qualified medical professionals, ensuring everyone has the right to quality healthcare, regardless of their location or economic status.
        </p>
      </div>

      {/* Our Mission Section */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto text-center border border-blue-100 mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4 sm:mb-6">Our Mission</h2>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Our mission is to eliminate geographical and economic barriers to healthcare. We strive to empower communities by providing timely, expert medical advice and support through a secure and user-friendly tele-consultation platform, fostering healthier lives and brighter futures.
        </p>
      </div>

      {/* Founders Section - with slightly different background and refined cards */}
      <div className="bg-blue-50 p-6 sm:p-10 rounded-2xl shadow-3xl w-full max-w-6xl mx-auto text-center border border-blue-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-6 sm:mb-8">Our Founders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Founder 1 */}
          <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl shadow-xl border border-blue-200">
            <img
              src="https://placehold.co/120x120/ADD8E6/000000?text=Founder+1"
              alt="Founder 1"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover mb-4 shadow-md border-2 border-blue-300"
            />
            <h3 className="text-xl font-bold text-blue-800 mb-1">Dr. Jane Doe</h3>
            <p className="text-sm text-gray-700 italic mb-2">Chief Medical Officer</p>
            <p className="text-xs text-gray-600 leading-snug">
              A visionary physician with 20+ years in public health, passionate about equitable healthcare.
            </p>
          </div>
          {/* Founder 2 */}
          <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl shadow-xl border border-blue-200">
            <img
              src="https://placehold.co/120x120/ADD8E6/000000?text=Founder+2"
              alt="Founder 2"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover mb-4 shadow-md border-2 border-blue-300"
            />
            <h3 className="text-xl font-bold text-blue-800 mb-1">Mr. John Smith</h3>
            <p className="text-sm text-gray-700 italic mb-2">Chief Technology Officer</p>
            <p className="text-xs text-gray-600 leading-snug">
              A tech innovator with a background in scalable software solutions for social good.
            </p>
          </div>
          {/* Founder 3 */}
          <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl shadow-xl border border-blue-200">
            <img
              src="https://placehold.co/120x120/ADD8E6/000000?text=Founder+3"
              alt="Founder 3"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover mb-4 shadow-md border-2 border-blue-300"
            />
            <h3 className="text-xl font-bold text-blue-800 mb-1">Ms. Emily White</h3>
            <p className="text-sm text-gray-700 italic mb-2">Head of Community Outreach</p>
            <p className="text-xs text-gray-600 leading-snug">
              An experienced humanitarian, bridging the gap between technology and community needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
