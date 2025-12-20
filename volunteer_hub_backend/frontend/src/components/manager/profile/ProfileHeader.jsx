import React, { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function ProfileHeader({ user, onEdit }) {
  const [imgError, setImgError] = useState(false);
  
  if (!user) return null;
  
  const getAvatarUrl = () => {
    if (imgError) return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&size=128&background=10b981&color=fff';
    
    if (user.avatarUrl) {
      return user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`;
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&size=128&background=10b981&color=fff';
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg flex-shrink-0 bg-gray-100">
          <img 
            src={getAvatarUrl()} 
            alt={user.name || 'User'} 
            className="w-full h-full object-cover" 
            onError={() => setImgError(true)}
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{user.name || 'Người dùng'}</h2>
          <p className="text-sm text-gray-500">{user.role || 'Manager'} • {user.organization || 'Tổ chức'}</p>
          <p className="text-sm text-gray-600 mt-2">{user.location || 'Vị trí'}</p>
        </div>
      </div>

      <div className="ml-auto flex gap-3 w-full md:w-auto">
        <button onClick={onEdit} className="ml-auto px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Chỉnh sửa</button>
        <button className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">Nhắn</button>
      </div>
    </div>
  )
}
