import React from 'react'
import Avatar from '@/components/ui/avatar.jsx'

export default function ProfileHeader({ user, onEdit }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow">
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.role} • {user.organization}</p>
          <p className="text-sm text-gray-600 mt-2">{user.location}</p>
        </div>
      </div>

      <div className="ml-auto flex gap-3 w-full md:w-auto">
        <button onClick={onEdit} className="ml-auto px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Chỉnh sửa</button>
        <button className="px-3 py-2 rounded-md border border-gray-200 text-gray-700">Nhắn</button>
      </div>
    </div>
  )
}
