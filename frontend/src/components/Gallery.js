import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';

const GalleryItem = ({ src, alt, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer"
    onClick={onClick}
  >
    <img src={src} alt={alt} className="w-full h-48 sm:h-64 object-cover" />
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <p className="text-white text-lg font-semibold">{alt}</p>
    </div>
  </motion.div>
);

const Modal = ({ src, alt, onClose, onNext, onPrev }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">
      <FaTimes />
    </button>
    <button onClick={onPrev} className="absolute left-4 text-white text-2xl">
      <FaArrowLeft />
    </button>
    <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
    <button onClick={onNext} className="absolute right-4 text-white text-2xl">
      <FaArrowRight />
    </button>
  </div>
);

const Gallery = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: "/images/img1.jpg", alt: t('Gallery Image 1') },
    { src: "/images/img2.jpg", alt: t('Gallery Image 2') },
    { src: "/images/img3.jpeg", alt: t('Gallery Image 3') },
    { src: "/images/img4.jpg", alt: t('Gallery Image 4') },
    { src: "/images/img5.jpg", alt: t('Gallery Image 5') },
    { src: "/images/img6.jpg", alt: t('Gallery Image 6') },
  ];

  const openModal = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const showNextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const showPrevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="section-title text-center mb-12">{t('Gallery')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((image, index) => (
          <GalleryItem key={index} {...image} onClick={() => openModal(index)} />
        ))}
      </div>
      {selectedImage && (
        <Modal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={closeModal}
          onNext={showNextImage}
          onPrev={showPrevImage}
        />
      )}
    </div>
  );
};

export default Gallery;

