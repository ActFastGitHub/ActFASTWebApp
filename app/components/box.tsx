// components/Box.tsx

import React from 'react';
import { useRouter } from 'next/navigation';

interface BoxProps {
  id: number;
  name: string;
  color: string;
}

const Box: React.FC<BoxProps> = ({ id, name, color }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/edit-box/${id}?name=${name}&color=${color}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`${color} border border-gray-400 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex flex-col items-start justify-start p-1`}
    >
      <div className="text-xs sm:text-sm md:text-base lg:text-lg">{id}</div>
      <div className="flex-1 flex items-center justify-center cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg">
        {name}
      </div>
    </button>
  );
};

export default Box;
