import React, { useState } from 'react'
import SimpleAlert from '@/components/ui/SimpleAlert'
import AvatarUploader from './AvatarUploader'

export default function EditProfileModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState({ ...initialData })
  const [alert, setAlert] = useState(null)

  const handleChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleAvatar = (file, preview) => {
    setForm((p) => ({ ...p, avatarUrl: preview, avatarFile: file }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // basic validation
    if (!form.name || !form.email) {
      setAlert({ type: 'error', message: 'Vui lòng điền tên và email.' })
      return
    }
    setAlert({ type: 'success', message: 'Đang lưu...' })
    try {
      await onSave(form)
      setAlert({ type: 'success', message: 'Lưu thành công.' })
      setTimeout(() => onClose(), 700)
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Lỗi khi lưu.' })
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Chỉnh sửa hồ sơ</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Tên</label>
                <input value={form.name || ''} onChange={handleChange('name')} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input value={form.email || ''} onChange={handleChange('email')} className="w-full border px-3 py-2 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Số điện thoại</label>
                <input value={form.phone || ''} onChange={handleChange('phone')} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Tổ chức</label>
                <input value={form.organization || ''} onChange={handleChange('organization')} className="w-full border px-3 py-2 rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Địa điểm</label>
              <input value={form.location || ''} onChange={handleChange('location')} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Giới thiệu</label>
              <textarea value={form.bio || ''} onChange={handleChange('bio')} className="w-full border px-3 py-2 rounded" rows={4} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Ảnh đại diện</label>
              <AvatarUploader initialPreview={form.avatarUrl} onChange={handleAvatar} />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Hủy</button>
              <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white">Lưu</button>
            </div>
          </form>
        </div>
      </div>
      {alert && <SimpleAlert type={alert.type} message={alert.message} onClose={() => {}} />}
    </>
  )
}
