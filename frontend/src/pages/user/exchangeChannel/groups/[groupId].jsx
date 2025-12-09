import React from 'react';
import { useRouter } from 'next/router';
import CommentList from "@/components/comments/CommentList";
import PostContainer from "@/containers/PostContainer";

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = router.query;

  // In a real app, you would fetch group details here using groupId
  // const { data: group } = useSWR(`/api/groups/${groupId}`, fetcher);

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 mb-6 shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Group: {groupId}</h1>
          <p className="text-blue-100 opacity-90">
            Welcome to the exchange channel for {groupId}. Share posts, discuss topics, and collaborate.
          </p>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar (Optional - e.g., Group Info, Members) */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4 border">
            <h3 className="font-semibold text-gray-700 mb-3">About</h3>
            <p className="text-sm text-gray-500 mb-4">
              This is the official group for {groupId}. Please follow the community guidelines.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active now
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Reuse PostContainer for the feed */}
          <PostContainer />

          {/* Example Comment List (if not included in PostContainer) */}
          {/* <CommentList comments={[]} /> */}
        </div>
      </div>
    </div>
  );
}
