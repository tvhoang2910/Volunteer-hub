import axios from 'axios';

// Mock data for immediate usage
const MOCK_POSTS = [
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

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Axios instance (configured for real API usage later)
const api = axios.create({
    baseURL: 'https://api.example.com', // Replace with real API
    headers: {
        'Content-Type': 'application/json',
    },
});

export const postService = {
    getPosts: async (page = 1, limit = 10) => {
        // REAL CALL: return api.get(`/posts?page=${page}&limit=${limit}`);

        // MOCK CALL:
        await delay(800);
        // Simulate infinite scroll by returning same data but with different IDs if page > 1
        const newPosts = MOCK_POSTS.map(p => ({
            ...p,
            id: p.id + (page - 1) * 10
        }));
        return {
            data: newPosts,
            hasMore: page < 5 // Limit to 5 pages for demo
        };
    },

    getPost: async (id) => {
        // REAL CALL: return api.get(`/posts/${id}`);
        await delay(500);
        return MOCK_POSTS.find(p => p.id === id) || MOCK_POSTS[0];
    },

    createPost: async (formData) => {
        // REAL CALL: return api.post('/posts', formData);
        await delay(1000);
        const newPost = {
            id: Date.now(),
            user: {
                id: 999,
                name: 'Current User',
                avatar: 'https://i.pravatar.cc/150?u=999',
            },
            content: formData.get('content'),
            media: [], // Handle media upload mock
            likes: 0,
            comments: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
        };

        // Mock media handling
        const files = formData.getAll('media');
        if (files && files.length > 0) {
            // In a real app, these would be URLs from S3/Cloudinary
            newPost.media = files.map((file, index) => ({
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: URL.createObjectURL(file)
            }));
        }

        return newPost;
    },

    updatePost: async (id, formData) => {
        // REAL CALL: return api.put(`/posts/${id}`, formData);
        await delay(800);
        return {
            id,
            content: formData.get('content'),
            // ... other updated fields
        };
    },

    deletePost: async (id) => {
        // REAL CALL: return api.delete(`/posts/${id}`);
        await delay(500);
        return { success: true };
    },

    toggleReaction: async (id) => {
        // REAL CALL: return api.post(`/posts/${id}/reactions`);
        await delay(300);
        return { success: true };
    }
};
