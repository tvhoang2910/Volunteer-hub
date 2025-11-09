import React, { useEffect, useState } from 'react'
import ProfileHeader from '@/components/manager/profile/ProfileHeader'
import ProfileDetails from '@/components/manager/profile/ProfileDetails'
import EditProfileModal from '@/components/manager/profile/EditProfileModal'
import SimpleAlert from '@/components/ui/SimpleAlert'
import Tabs from '@/components/common/Tabs'
import managerService from '@/services/managerService'

const tabs = [
  { key: 'info', label: 'Thông tin' },
  { key: 'activity', label: 'Hoạt động' },
  { key: 'settings', label: 'Cài đặt' },
  { key: 'security', label: 'Bảo mật' },
]

export default function ManagerProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [alert, setAlert] = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    let mounted = true
    managerService.getProfile().then((u) => {
      if (!mounted) return
      setUser(u)
      setLoading(false)
    })
    return () => (mounted = false)
  }, [])

  const handleSave = async (data) => {
    try {
      setAlert({ type: 'success', message: 'Đang lưu...' })
      const updated = await managerService.updateProfile(data)
      setUser(updated)
      setAlert({ type: 'success', message: 'Cập nhật hồ sơ thành công.' })
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Lỗi khi lưu.' })
      throw err
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <div className="mx-auto px-6 lg:px-10 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hồ sơ quản lý</h1>
          <div />
        </div>

        {alert && (
          <SimpleAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {loading ? (
          <div className="p-6 bg-white rounded shadow">Đang tải...</div>
        ) : (
          <>
            <ProfileHeader user={user} onEdit={() => setShowEdit(true)} />

            <div className="mt-6">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {activeTab === 'info' && <ProfileDetails user={user} />}
                  {activeTab === 'activity' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">Hoạt động gần đây (placeholder)</div>
                  )}
                  {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">Cài đặt thông báo (placeholder)</div>
                  )}
                  {activeTab === 'security' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">Bảo mật & mật khẩu (placeholder)</div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold">Thống kê</h4>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-3 rounded text-emerald-700">{user.stats.managedProjects} dự án</div>
                      <div className="bg-emerald-50 p-3 rounded text-emerald-700">{user.stats.volunteers} tình nguyện viên</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">Các hành động nhanh (placeholder)</div>
                </aside>
              </div>
            </div>
          </>
        )}

        {showEdit && (
          <EditProfileModal
            initialData={user}
            onClose={() => setShowEdit(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}
