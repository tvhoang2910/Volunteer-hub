import React from "react";

const reactions = [
    { name: "Like", emoji: "👍", color: "text-blue-500" },
    { name: "Love", emoji: "❤️", color: "text-red-500" },
    { name: "Haha", emoji: "😂", color: "text-yellow-500" },
    { name: "Wow", emoji: "😮", color: "text-yellow-400" },
    { name: "Sad", emoji: "😢", color: "text-blue-400" },
    { name: "Angry", emoji: "😡", color: "text-red-600" },
];

const ReactionPicker = ({ onSelect }) => {
    return (
        <div className="relative flex justify-center">
            {/* Bao quanh */}
            <div className="absolute bottom-full mb-2 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-lg px-3 py-2 border border-gray-200 dark:border-neutral-700 space-x-2">
                {/* Round */}
                <div className="flex space-x-2">
                    {/* Từng nút */}
                    {reactions.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => onSelect && onSelect(item.name)}
                            className="flex flex-col items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform duration-150"
                        >
                            <span
                                className={`text-3xl ${item.color} drop-shadow-sm`}
                                title={item.name}
                            >
                                {item.emoji}
                            </span>
                            <span className="mt-1 hidden group-hover:block">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReactionPicker;
