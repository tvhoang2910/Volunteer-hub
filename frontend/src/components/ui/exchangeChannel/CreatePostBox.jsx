import React, { useState, useEffect } from 'react';
import { fetchCustomerInfo } from '@/services/customerService';

const CreatePostBox = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userName, setUserName] = useState('Bạn');
  const [userAvatar, setUserAvatar] = useState('https://random.imagecdn.app/200/200');

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const data = await fetchCustomerInfo();
        setUserInfo(data);
        if (data) {
          const fullName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : data.firstName || data.lastName || data.name || 'Bạn';
          setUserName(fullName);
          if (data.avatar || data.profileImage || data.image) {
            setUserAvatar(data.avatar || data.profileImage || data.image);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
      }
    };

    loadUserInfo();
  }, []);

  return (
    <div className="flex flex-col rounded-lg bg-white p-3 px-4 shadow dark:bg-neutral-800">
      <div className="mb-2 flex items-center space-x-2 border-b pb-3 dark:border-neutral-700">
        <div className="h-10 w-10">
          <img
            src={userAvatar}
            className="h-full w-full rounded-full object-cover"
            alt="avatar"
          />
        </div>
        <button className="h-10 flex-grow rounded-full bg-gray-100 pl-5 text-left text-gray-500 hover:bg-gray-200 focus:bg-gray-300 focus:outline-none dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700">
          Bạn đang nghĩ gì, {userName}?
        </button>
      </div>
      <div className="-mb-1 flex space-x-3 text-sm font-thin">
        <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
          <div>
            <i className="fab fa-youtube text-red-600"></i>
          </div>
          <div>
            <p className="font-semibold">Tạo Video</p>
          </div>
        </button>
        <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
          <div>
            <i className="fas fa-images text-green-600"></i>
          </div>
          <div>
            <p className="font-semibold">Ảnh/Video</p>
          </div>
        </button>
        <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
          <div>
            <i className="far fa-smile text-yellow-600"></i>
          </div>
          <div>
            <p className="font-semibold">Cảm xúc/Hoạt động</p>
          </div>
        </button>
      </div>
    </div>  
  );
};

export default CreatePostBox;
