import React from 'react';

const StatusBadge = ({ status }) => {
  const statusClasses = {
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;