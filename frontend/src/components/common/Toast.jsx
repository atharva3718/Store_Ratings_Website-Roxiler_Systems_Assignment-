import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', duration = 1800, onClose }) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShown(true), 10);
    const t2 = setTimeout(() => {
      setShown(false);
      const t3 = setTimeout(() => onClose && onClose(), 220);
      return () => clearTimeout(t3);
    }, duration);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration, onClose]);

  const wrapper = 'fixed inset-0 z-50 flex items-center justify-center pointer-events-none';
  const box = 'pointer-events-auto rounded-lg shadow-lg px-4 py-3 min-w-[220px] max-w-[90vw] transition-all duration-300 ease-out transform';
  const visible = shown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95';
  const colors =
    type === 'success'
      ? 'bg-green-600 text-white'
      : type === 'error'
      ? 'bg-red-600 text-white'
      : 'bg-gray-800 text-white';

  return (
    <div role="status" aria-live="polite" className={wrapper}>
      <div className={`${box} ${colors} ${visible}`}>
        <div className="flex items-start gap-2">
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Toast;
