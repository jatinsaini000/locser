import React from 'react';

const statuses = [
  { id: 'PENDING', label: 'Pending', icon: '🕒' },
  { id: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: '🛠️' },
  { id: 'COMPLETED', label: 'Completed', icon: '🎉' }
];

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = statuses.findIndex(s => s.id === currentStatus);
  
  return (
    <div className="flex flex-col space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">Booking Progress</h3>
      <div className="relative flex justify-between items-start">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>

        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white border-gray-200 text-gray-400'
                } ${isCurrent ? 'scale-110 ring-4 ring-blue-50' : ''}`}
              >
                <span className="text-lg">{status.icon}</span>
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium whitespace-nowrap ${
                  isCompleted ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {status.label}
                </p>
                {isCurrent && (
                  <span className="inline-block px-2 py-0.5 mt-1 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
