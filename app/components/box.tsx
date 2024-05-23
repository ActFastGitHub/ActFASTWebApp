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
      className={`${color} border border-gray-400 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 flex flex-col items-start justify-start p-1`}
    >
      <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">{id}</div>
      <div className="flex-1 flex items-center justify-center cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
        {name}
      </div>
    </button>
  );
};

export default Box;
