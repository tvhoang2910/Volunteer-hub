import React, { useState } from 'react';

const PostMedia = ({ media }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    if (!media || media.length === 0) return null;

    const openLightbox = (url) => {
        setSelectedImage(url);
        setLightboxOpen(true);
    };

    const renderGrid = () => {
        const count = media.length;

        if (count === 1) {
            const item = media[0];
            if (item.type === 'video') {
                return (
                    <div className="w-full">
                        <video controls className="w-full max-h-[500px] bg-black">
                            <source src={item.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            }
            return (
                <div
                    className="cursor-pointer"
                    onClick={() => openLightbox(item.url)}
                >
                    <img src={item.url} alt="Post media" className="w-full object-cover max-h-[600px]" />
                </div>
            );
        }

        if (count === 2) {
            return (
                <div className="grid grid-cols-2 gap-1 h-[300px]">
                    {media.map((item, idx) => (
                        <div key={idx} className="h-full cursor-pointer overflow-hidden" onClick={() => openLightbox(item.url)}>
                            <img src={item.url} alt={`Media ${idx}`} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                        </div>
                    ))}
                </div>
            );
        }

        if (count === 3) {
            return (
                <div className="grid grid-cols-2 gap-1 h-[300px]">
                    <div className="h-full cursor-pointer overflow-hidden" onClick={() => openLightbox(media[0].url)}>
                        <img src={media[0].url} alt="Media 0" className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-rows-2 gap-1 h-full">
                        {media.slice(1, 3).map((item, idx) => (
                            <div key={idx} className="h-full cursor-pointer overflow-hidden" onClick={() => openLightbox(item.url)}>
                                <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 4 or more
        return (
            <div className="grid grid-cols-2 gap-1 h-[300px]">
                {media.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="h-full cursor-pointer overflow-hidden" onClick={() => openLightbox(item.url)}>
                        <img src={item.url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className="relative h-full cursor-pointer overflow-hidden" onClick={() => openLightbox(media[3].url)}>
                    <img src={media[3].url} alt="Media 3" className="w-full h-full object-cover" />
                    {count > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                            +{count - 4}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-2">
            {renderGrid()}

            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800 hover:bg-gray-700"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default PostMedia;
