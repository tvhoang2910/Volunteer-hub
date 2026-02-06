import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import { eventService } from '@/services/eventService';
import axios from 'axios';
import Post from '@/components/post/Post';
import CreatePostInput from '@/components/post/CreatePostInput';
import PostSkeleton from '@/components/post/PostSkeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function EventPosts() {
  const router = useRouter();
  const { eventId } = router.query;
  
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Infinite scroll observer
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (postsLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [postsLoading, hasMore]);

  const fetchEventDetails = async () => {
    try {
      const data = await eventService.getEventDetails(eventId);
      console.log('[EventPosts] Event details:', data);
      setEvent(data);
    } catch (err) {
      console.error('[EventPosts] Error fetching event:', err);
      setError(err.message || 'Không thể tải thông tin sự kiện');
    }
  };

  const fetchPosts = async (pageNum = 0, isRefresh = false) => {
    try {
      setPostsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/posts/event/${eventId}?page=${pageNum}&size=10`,
        { headers: getAuthHeader() }
      );
      
      console.log('[EventPosts] Posts response:', response.data);
      const postsData = response.data?.data?.content || [];
      const totalPages = response.data?.data?.totalPages || 1;
      
      if (isRefresh) {
        setPosts(postsData);
      } else {
        setPosts(prev => [...prev, ...postsData]);
      }
      
      setHasMore(pageNum < totalPages - 1);
    } catch (err) {
      console.error('[EventPosts] Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (!postsLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  };

  useEffect(() => {
    if (router.isReady && eventId) {
      setLoading(true);
      Promise.all([
        fetchEventDetails(),
        fetchPosts(0, true)
      ]).finally(() => setLoading(false));
    }
  }, [router.isReady, eventId]);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (deletedId) => {
    console.log('[EventPosts] Deleting post with id:', deletedId);
    setPosts(prevPosts => prevPosts.filter(p => (p.id || p.postId) !== deletedId));
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="h-48 bg-gray-200 animate-pulse rounded-xl mb-6"></div>
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Link href="/user/exchangeChannel" className="text-emerald-500 hover:underline mt-4 inline-block">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Event Header */}
      <div 
        className="rounded-xl p-6 mb-6 shadow-lg text-white relative overflow-hidden"
        style={{
          backgroundImage: event?.thumbnailUrl 
            ? `url(${event.thumbnailUrl.startsWith('http') ? event.thumbnailUrl : `${API_BASE_URL}${event.thumbnailUrl}`})` 
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`absolute inset-0 ${event?.thumbnailUrl ? 'bg-black/50' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}></div>
        <div className="relative z-10">
          <Link 
            href="/user/exchangeChannel" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold mb-2">{event?.title}</h1>
          <p className="text-white/80 opacity-90 mb-4">
            {event?.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event?.location || 'Chưa cập nhật'}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {event?.startTime ? new Date(event.startTime).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              {event?.maxVolunteers || 0} tình nguyện viên
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - About */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4 border">
            <h3 className="font-semibold text-gray-700 mb-3">Giới thiệu</h3>
            <p className="text-sm text-gray-500 mb-4">
              {event?.description || 'Chưa có mô tả'}
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Người tổ chức:</span>
                <span>{event?.createdByName || 'Chưa cập nhật'}</span>
              </div>
              {event?.contactEmail && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{event.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Create Post */}
          <CreatePostInput onPostCreated={handlePostCreated} eventId={eventId} />

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id || post.postId}>
                    <Post
                      post={post}
                      onPostDeleted={handlePostDeleted}
                    />
                  </div>
                );
              } else {
                return (
                  <Post
                    key={post.id || post.postId}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                );
              }
            })}
          </div>

          {postsLoading && (
            <div className="mt-4">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center text-gray-500 py-8">
              Bạn đã xem hết tất cả bài viết.
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
              <p className="mb-2">Chưa có bài viết nào trong sự kiện này.</p>
              <p className="text-sm">Hãy là người đầu tiên đăng bài!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
