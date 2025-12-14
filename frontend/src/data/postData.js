
export const MOCK_POSTS = [
    {
        id: 1,
        user: {
            id: 101,
            name: 'Nguyen Van A',
            avatar: 'https://i.pravatar.cc/150?u=101',
        },
        content: 'Hello world! This is a Facebook-like post system built with React & Tailwind. #ReactJS #Tailwind',
        media: [
            { type: 'image', url: 'https://picsum.photos/seed/1/600/400' },
            { type: 'image', url: 'https://picsum.photos/seed/2/600/400' }
        ],
        likes: 120,
        comments: 45,
        isLiked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 2,
        user: {
            id: 102,
            name: 'Tran Thi B',
            avatar: 'https://i.pravatar.cc/150?u=102',
        },
        content: 'Check out this amazing video! 🎥',
        media: [
            { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ],
        likes: 5,
        comments: 2,
        isLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
        id: 3,
        user: {
            id: 103,
            name: 'Le Van C',
            avatar: 'https://i.pravatar.cc/150?u=103',
        },
        content: 'Just text content here. Simple and clean.',
        media: [],
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    }
];
