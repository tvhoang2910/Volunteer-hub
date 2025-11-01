import { useRouter } from "next/router";

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

  return (
    <div className="container mx-auto pt-10 pl-64 space-y-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {group ? group.name : `Kênh trao đổi sự kiện #${groupId}`}
        </h1>
        <p className="text-muted-foreground">
          {group ? group.desc : `Thảo luận về sự kiện với ID: ${groupId}`}
        </p>
        {/* Ở đây sẽ thêm các component chat, messages, etc. */}
      </div>
    </div>
  );
}

