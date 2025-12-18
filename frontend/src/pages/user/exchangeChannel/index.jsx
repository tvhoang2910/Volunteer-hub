import React from 'react';
import GroupCard from '@/components/exchange/GroupCard';
import { useGroup } from '@/hooks/useGroup';



export default function ExchangeChannel() {
  const { groups } = useGroup();

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kênh trao đổi</h1>
        <p className="text-gray-600">Tham gia vào nhóm để bắt đầu trao đổi và thảo luận.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}