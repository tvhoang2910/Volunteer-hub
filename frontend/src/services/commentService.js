import axios from 'axios';

// Mock data from user request
const MOCK_ROOT_COMMENTS = {
    "data": [
        {
            "id": 157393,
            "user_id": 423761,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "hay đó&#x20;",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-12-29T19:33:38.000000Z",
            "updated_at": "2024-12-29T19:33:38.000000Z",
            "commentator": {
                "data": {
                    "id": 423761,
                    "username": "nguyendinhhuan1",
                    "full_name": "Huân Nguyễn Đình",
                    "avatar_url": "",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": []
            }
        },
        {
            "id": 155836,
            "user_id": 321011,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "![3969](https://files.fullstack.edu.vn/f8-prod/public-images/6745d3e38fc2a.jpg)",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-11-26T13:57:56.000000Z",
            "updated_at": "2024-11-26T13:57:56.000000Z",
            "commentator": {
                "data": {
                    "id": 321011,
                    "username": "lazykun",
                    "full_name": "Hữu Lộc",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/321011/64579ae17c73c.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": []
            }
        },
        {
            "id": 155826,
            "user_id": 321011,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "fdfs",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-11-26T12:52:45.000000Z",
            "updated_at": "2024-11-26T12:52:45.000000Z",
            "commentator": {
                "data": {
                    "id": 321011,
                    "username": "lazykun",
                    "full_name": "Hữu Lộc",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/321011/64579ae17c73c.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": []
            }
        },
        {
            "id": 155825,
            "user_id": 321011,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "![3962](https://files.fullstack.edu.vn/f8-prod/public-images/6745c48daae1e.jpg)",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-11-26T12:52:31.000000Z",
            "updated_at": "2024-11-26T12:52:31.000000Z",
            "commentator": {
                "data": {
                    "id": 321011,
                    "username": "lazykun",
                    "full_name": "Hữu Lộc",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/321011/64579ae17c73c.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": []
            }
        },
        {
            "id": 155376,
            "user_id": 395593,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "hay",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-11-17T07:08:46.000000Z",
            "updated_at": "2024-11-17T07:08:46.000000Z",
            "commentator": {
                "data": {
                    "id": 395593,
                    "username": "tunguyentuan1",
                    "full_name": "Nguyễn Tuấn Tú",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/395593/65ff20032960c.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": []
            }
        },
        {
            "id": 140239,
            "user_id": 119926,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "mình có tiếng Nhật nên giờ phải học thêm code để đi làm đây :(((",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 1,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-04-13T16:33:26.000000Z",
            "updated_at": "2024-04-13T16:33:26.000000Z",
            "commentator": {
                "data": {
                    "id": 119926,
                    "username": "thodoanh",
                    "full_name": "Anh Thơ Đỗ",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/public-images/68ba555a664fe.png",
                    "is_pro": true,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": [
                    {
                        "id": 92396,
                        "user_id": 310051,
                        "type": "like"
                    }
                ]
            }
        },
        {
            "id": 138729,
            "user_id": 395531,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "hay",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 2,
            "replies_count": 0,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-03-23T12:53:10.000000Z",
            "updated_at": "2024-03-23T12:53:10.000000Z",
            "commentator": {
                "data": {
                    "id": 395531,
                    "username": "anhquanle6",
                    "full_name": "lêff quân",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/395531/65fec3195ddcd.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": [
                    {
                        "id": 91135,
                        "user_id": 13286,
                        "type": "love"
                    },
                    {
                        "id": 91480,
                        "user_id": 310051,
                        "type": "like"
                    }
                ]
            }
        },
        {
            "id": 138616,
            "user_id": 204793,
            "commentable_type": "App\\Common\\Models\\BlogPost",
            "commentable_id": "9975",
            "comment": "When i say 1337 u say DVD (☞ﾟヮﾟ)☞",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 1,
            "replies_count": 2,
            "replies": [],
            "current_page": 0,
            "created_at": "2024-03-21T14:44:33.000000Z",
            "updated_at": "2024-03-21T14:44:33.000000Z",
            "commentator": {
                "data": {
                    "id": 204793,
                    "username": "gfivetran",
                    "full_name": "Tran Gfive",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/204793/62872b068eb8d.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": [
                    {
                        "id": 91140,
                        "user_id": 395531,
                        "type": "like"
                    }
                ]
            }
        }
    ],
    "meta": {
        "commentable": {
            "id": 9975,
            "user_id": 13286,
            "best_comment_id": null
        },
        "pagination": {
            "total": 8,
            "count": 8,
            "per_page": 10,
            "current_page": 1,
            "total_pages": 1,
            "links": {}
        }
    }
};

const MOCK_REPLIES = {
    "data": [
        {
            "id": 138633,
            "user_id": 13286,
            "commentable_type": "App\\Common\\Models\\Comment",
            "commentable_id": "138616",
            "comment": "<user-mention data-id=\"204793\">Tran Gfive</user-mention>  =)))))))))))))))",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [

            ],
            "current_page": 0,
            "created_at": "2024-03-22T01:08:41.000000Z",
            "updated_at": "2024-06-13T12:27:41.000000Z",
            "commentator": {
                "data": {
                    "id": 13286,
                    "username": "nam-nori",
                    "full_name": "Trọng Nam Đoàn",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_avatars/13286/65fa6676d4644.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": [

                ]
            }
        },
        {
            "id": 139104,
            "user_id": 322627,
            "commentable_type": "App\\Common\\Models\\Comment",
            "commentable_id": "138616",
            "comment": "<user-mention data-id=\"204793\">Tran Gfive</user-mention>  :))",
            "is_approved": true,
            "is_answered": false,
            "is_removed": false,
            "reactions_count": 0,
            "replies_count": 0,
            "replies": [

            ],
            "current_page": 0,
            "created_at": "2024-03-29T05:06:22.000000Z",
            "updated_at": "2024-06-13T12:27:39.000000Z",
            "commentator": {
                "data": {
                    "id": 322627,
                    "username": "longle60",
                    "full_name": "Lê Long",
                    "avatar_url": "https://files.fullstack.edu.vn/f8-prod/user_photos/322627/645e4e7a8aaea.jpg",
                    "is_pro": false,
                    "is_verified": false,
                    "is_blocked": false
                }
            },
            "reactions": {
                "data": [

                ]
            }
        }
    ],
    "meta": {
        "commentable": {
            "id": 138616,
            "user_id": 204793,
            "best_comment_id": null
        },
        "pagination": {
            "total": 2,
            "count": 2,
            "per_page": 10,
            "current_page": 1,
            "total_pages": 1,
            "links": {

            }
        }
    }
};

const API_URL = 'https://api.example.com'; // Replace with actual API URL if available
const USE_MOCK = true; // Toggle this to use real API

export const fetchComments = async (postId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_ROOT_COMMENTS);
            }, 500);
        });
    }
    const response = await axios.get(`${API_URL}/comments`, {
        params: {
            commentable_type: 'BlogPost',
            commentable_id: postId
        }
    });
    return response.data;
};

export const fetchReplies = async (commentId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_REPLIES);
            }, 500);
        });
    }
    const response = await axios.get(`${API_URL}/comments`, {
        params: {
            commentable_type: 'Comment',
            commentable_id: commentId
        }
    });
    return response.data;
};

export const postComment = async (data) => {
    // data: { commentable_type, commentable_id, comment }
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        id: Date.now(),
                        user_id: 999999,
                        commentable_type: data.commentable_type,
                        commentable_id: data.commentable_id,
                        comment: data.comment,
                        is_approved: true,
                        is_answered: false,
                        is_removed: false,
                        reactions_count: 0,
                        replies_count: 0,
                        replies: [],
                        current_page: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        commentator: {
                            data: {
                                id: 999999,
                                username: "current_user",
                                full_name: "Current User",
                                avatar_url: "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f9a2fd4e064.jpg",
                                is_pro: true,
                                is_verified: true,
                                is_blocked: false
                            }
                        },
                        reactions: { data: [] }
                    }
                });
            }, 500);
        });
    }
    const response = await axios.post(`${API_URL}/comments`, data);
    return response.data;
};

export const postReply = async (data) => {
    return postComment(data); // Same endpoint structure usually
};
