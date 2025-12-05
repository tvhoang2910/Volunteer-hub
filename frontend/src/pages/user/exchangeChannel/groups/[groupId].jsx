import { useRouter } from "next/router";
import Post from "@/components/post/Post";

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = router.query;

  // groupId sẽ là eventId được truyền vào từ trang exchangeChannel
  // Có thể fetch thông tin event/group từ API dựa trên groupId (eventId)

  const groupData = {
    "react-vietnam": { name: "React Vietnam", desc: "Cộng đồng React Việt Nam" },
    "frontend-devs": { name: "Frontend Devs", desc: "Nhóm lập trình frontend" },
  };

  // Tạm thời sử dụng mock data, có thể thay thế bằng API call
  const group = groupData[groupId];

  if (!groupId) {
    return <div className="p-6">Đang tải...</div>;
  }

  // Có thể fetch thông tin event từ API:
  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${groupId}`)
  //     .then(res => res.json())
  //     .then(data => setEventData(data));
  // }, [groupId]);

  // Mock post for demonstration
  const mockPost = {
    id: groupId,
    title: `Post về sự kiện ${groupId}`,
    content: "Nội dung bài post mẫu.",
    comments: [
      {
        id: 1,
        message: "Comment mẫu",
        user: { id: 1, name: "User1" },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        likedByMe: false,
      }
    ]
  };

  return (
    <div className="container mx-auto pt-10 pl-64 space-y-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {group ? group.name : `Kênh trao đổi sự kiện #${groupId}`}
        </h1>
        <p className="text-muted-foreground">
          {group ? group.desc : `Thảo luận về sự kiện với ID: ${groupId}`}
        </p>
        {/* Thêm Post component */}
        <Post post={{
          id: mockPost.id,
          user: { id: 1, name: "User1", avatar: "https://i.pravatar.cc/150?u=1" },
          content: mockPost.content,
          media: [],
          likes: 0,
          comments: mockPost.comments.length,
          isLiked: false,
          createdAt: new Date().toISOString()
        }} />
      </div>
    </div>
  );
}

