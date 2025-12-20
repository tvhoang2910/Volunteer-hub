import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  HandHeart,
  CalendarDays,
  User,
  Users,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Quản lý sự kiện', href: '/admin/eventManage', icon: CalendarDays },
  { name: 'Quản lý người dùng', href: '/admin/userManage', icon: Users },
  { name: 'Xuất dữ liệu', href: '/admin/export', icon: FileText },
  { name: 'Hồ sơ cá nhân', href: '/admin/profile', icon: User }
]

export default function Navbar({ onCollapse }) {
  const router = useRouter()
  const { logout } = useAuth()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ===== Keep BE-connected layout logic =====
  useEffect(() => {
    const updateBodyOffset = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
      const width = isDesktop ? (isCollapsed ? 80 : 256) : 0
      document.body.style.paddingLeft = `${width}px`
      document.documentElement.style.setProperty('--sidebar-offset', `${width}px`)
    }

    updateBodyOffset()
    window.addEventListener('resize', updateBodyOffset)

    return () => {
      document.body.style.paddingLeft = ''
      document.documentElement.style.removeProperty('--sidebar-offset')
      window.removeEventListener('resize', updateBodyOffset)
    }
  }, [isCollapsed])

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v)

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapse?.(next)
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false)
      await logout()
    } finally {
      router.push('/')
    }
  }

  return (
    <>
      {/* ===== Mobile Header ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-500 rounded">
              <HandHeart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">V-connect</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ===== Mobile Overlay ===== */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* ===== Mobile Sidebar ===== */}
      <div
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-zinc-900 z-40 transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                router.pathname === item.href
                  ? 'bg-green-500/10 text-green-500'
                  : 'text-white hover:bg-green-500/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* ===== Desktop Sidebar ===== */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 bg-zinc-900 border-r border-zinc-800 transition-all ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col w-full">
          <div className={`p-6 border-b border-zinc-800`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <HandHeart className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="text-lg font-bold text-white">V-connect</h1>
              )}
            </div>
            <button
              onClick={toggleCollapse}
              className="mt-4 w-full flex justify-center text-zinc-400 hover:text-white"
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg transition ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${
                  router.pathname === item.href
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && 'Đăng xuất'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
