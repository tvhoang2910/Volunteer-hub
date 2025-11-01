import React, { useState } from 'react';

const ActionSymbol = ({ type = 'like', count: initialCount = 0 }) => {
    
  const [isSelected, setIsSelected] = useState(false);
  const [count, setCount] = useState(initialCount);

  const config = {
    like: {
      icon: '👍',
      text: 'Like',
      selectedColor: 'text-blue-600',
      unselectedColor: 'text-gray-600',
    },
    love: {
      icon: '❤️',
      text: 'Yêu thích',
      selectedColor: 'text-red-600',
      unselectedColor: 'text-gray-600',
    },
    support: {
      icon: '💪',
      text: 'Ủng hộ',
      selectedColor: 'text-green-600',
      unselectedColor: 'text-gray-600',
    },
  };

  const { icon, text, selectedColor, unselectedColor } = config[type] || config.like;
  const iconColor = isSelected ? selectedColor : unselectedColor;

  const handleClick = () => {
    if (isSelected) {
      setCount(count - 1);
      setIsSelected(false);
    } else {
      setCount(count + 1);
      setIsSelected(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 rounded-md px-3 py-2 transition-colors hover:bg-gray-100 focus:outline-none dark:hover:bg-neutral-700 ${
        isSelected ? 'bg-gray-100 dark:bg-neutral-700' : ''
      }`}
    >
      <span className={`text-lg ${iconColor}`}>{icon}</span>
      <span className={`text-sm font-medium ${iconColor} dark:text-gray-300`}>
        {text}
      </span>
      {count > 0 && (
        <span className={`text-sm font-semibold ${iconColor} dark:text-gray-300`}>
          {count}
        </span>
      )}
    </button>
  );
};

export default ActionSymbol;

