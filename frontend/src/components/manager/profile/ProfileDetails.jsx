import React from 'react'

function Field({ label, value }) {
  return (
    <div className="py-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-gray-800">{value || <span className="text-gray-400 italic">Chưa cập nhật</span>}</div>
    </div>
  )
}

export default function ProfileDetails({ user }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email" value={user.email} />
        <Field label="Số điện thoại" value={user.phone} />
        <Field label="Tổ chức" value={user.organization} />
        <Field label="Địa điểm" value={user.location} />
        <div className="md:col-span-2">
          <div className="text-sm text-gray-500">Giới thiệu</div>
          <div className="text-gray-800 mt-1">{user.bio || <span className="text-gray-400 italic">Chưa có mô tả</span>}</div>
        </div>
      </div>
    </div>
  )
}
