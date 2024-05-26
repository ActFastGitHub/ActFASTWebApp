// components/box.tsx

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
      className={`${color} border border-gray-400 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 flex flex-col items-start justify-start p-1 overflow-auto`}
    >
      <div className="text-xxs sm:text-sm md:text-base lg:text-lg xl:text-xl">{id}</div>
      <div className="flex-1 flex items-center justify-center cursor-pointer text-xxs sm:text-sm md:text-base lg:text-lg xl:text-xl">
        {name}
      </div>
    </button>
  );
};

export default Box;
