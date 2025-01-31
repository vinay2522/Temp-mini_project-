import React from 'react';
import { toast } from 'react-toastify';

const ToastTest = () => {
  const testToasts = () => {
    // Test success toast
    toast.success('This is a success message', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored"
    });

    // Test error toast
    setTimeout(() => {
      toast.error('This is an error message', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
    }, 1000);

    // Test info toast
    setTimeout(() => {
      toast.info('This is an info message', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
    }, 2000);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Toast Test Component</h2>
      <button
        onClick={testToasts}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Toast Messages
      </button>
    </div>
  );
};

export default ToastTest;
