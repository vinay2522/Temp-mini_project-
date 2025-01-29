import React from 'react';
import { FaAndroid, FaApple, FaWindows } from 'react-icons/fa';

const DownloadButton = ({ icon: Icon, text, link }) => (
  <a
    href={link}
    className="flex items-center justify-center bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 w-full sm:w-auto"
  >
    <Icon className="mr-2 text-2xl" />
    <span>{text}</span>
  </a>
);

const Download = () => {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Download Our App</h2>
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <p className="text-center text-sm sm:text-base mb-6">
          Get our mobile app for quick and easy access to emergency services.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DownloadButton icon={FaAndroid} text="Android App" link="#" />
          <DownloadButton icon={FaApple} text="iOS App" link="#" />
          <DownloadButton icon={FaWindows} text="Windows App" link="#" />
        </div>
      </div>
    </div>
  );
};

export default Download;

