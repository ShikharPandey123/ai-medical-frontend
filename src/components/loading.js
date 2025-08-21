'use client';

import { useEffect, useState } from 'react';

export default function LoadingSpinner({ 
  message = "Loading...", 
  showDoctorAnimation = true 
}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4">
        
        {/* Medical Cross Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto relative">
            {/* Rotating outer ring */}
            <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-spin border-t-teal-600"></div>
            
            {/* Medical cross in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Vertical bar */}
                <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Horizontal bar */}
                <div className="w-8 h-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stethoscope Animation (Optional) */}
        {showDoctorAnimation && (
          <div className="mb-6">
            <div className="text-4xl animate-bounce">🩺</div>
          </div>
        )}

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-teal-700">
            {message}{dots}
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we prepare your medical dashboard
          </p>
        </div>

        {/* Pulse Animation Bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 h-1 rounded-full animate-pulse w-3/4"></div>
        </div>

        {/* Heartbeat Animation */}
        <div className="mt-4 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 bg-teal-500 rounded-full animate-pulse"
              style={{
                height: '20px',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage examples:
// <LoadingSpinner />
// <LoadingSpinner message="Connecting to server" />
// <LoadingSpinner message="Loading patient data" showDoctorAnimation={false} />