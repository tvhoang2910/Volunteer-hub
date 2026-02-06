import React from 'react';
import PostContainer from '../containers/PostContainer';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-2xl font-bold text-blue-600">SocialApp</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="https://i.pravatar.cc/150?u=999"
                                    alt="Current User"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <PostContainer />
            </main>
        </div>
    );
};

export default HomePage;
