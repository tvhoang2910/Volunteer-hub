import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BellRing,
  UserCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const navItems = [
  { name: 'Tổng quan', href: '/manager/dashboard', icon: LayoutDashboard },
  { name: 'Quản lý sự kiện', href: '/manager/events', icon: Calendar },
  { name: 'Quản lý nhóm', href: '/manager/group', icon: Users },
  { name: 'Thông báo', href: '/manager/notifications', icon: BellRing },
  { name: 'Hồ sơ cá nhân', href: '/manager/profile', icon: UserCircle }
]

export default function ManagerNavbar({ onCollapse }) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Fetch user info from API
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('User info fetched:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Set a default user object so avatar still shows
        setUser({
          name: 'Manager',
          email: 'manager@volunteer.local'
        });
      }
    };

    fetchUserInfo();
  }, []);

  const getAvatarUrl = () => {
    if (!user) return 'https://ui-avatars.com/api/?name=User&size=128&background=10b981&color=fff';
    
    if (user.avatarUrl) {
      return user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`;
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.username || 'User') + '&size=128&background=10b981&color=fff';
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // ===== giữ logic layout của bạn (rất quan trọng) =====
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapse?.(next)
  }

  return (
    <>
      {/* ===== Mobile Header ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800/50 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Volunteer Hub</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg"
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
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 z-40 transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1 flex flex-col h-full">
          {/* User Avatar Section Mobile */}
          <Link 
            href="/manager/profile"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 mb-4"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 flex-shrink-0 bg-zinc-800">
              <img 
                src={getAvatarUrl()} 
                alt={user?.name || 'User'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?name=User&size=128&background=10b981&color=fff';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Người dùng'}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email || 'manager'}</p>
            </div>
          </Link>

          <div className="flex-1 space-y-1">
            {navItems.map(item => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/manager/dashboard' &&
                  router.pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <button
            onClick={() => {
              handleLogout()
              closeMobileMenu()
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition border-t border-zinc-800/50 mt-4 pt-4 w-full"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* ===== Desktop Sidebar ===== */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-r border-zinc-800/50 transition-all ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col w-full">
          <div className={`border-b border-zinc-800/50 ${isCollapsed ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="text-lg font-bold text-white">Volunteer Hub</h1>
              )}
            </div>

            <button
              onClick={toggleCollapse}
              className="mt-4 w-full flex justify-center text-zinc-400 hover:text-white"
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
            {navItems.map(item => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== '/manager/dashboard' &&
                  router.pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl transition ${
                    isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Avatar Section */}
          <div className={`border-t border-zinc-800/50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <Link 
              href="/manager/profile"
              className={`flex items-center rounded-xl transition text-zinc-400 hover:bg-zinc-800/50 hover:text-white w-full ${
                isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
              }`}
              title={isCollapsed ? user?.name || 'Profile' : ''}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0 bg-zinc-800">
                <img 
                  src={getAvatarUrl()} 
                  alt={user?.name || 'User'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=User&size=128&background=10b981&color=fff';
                  }}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email || 'manager'}</p>
                </div>
              )}
            </Link>
          </div>

          <div className={`border-t border-zinc-800/50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center rounded-xl transition text-zinc-400 hover:bg-red-500/10 hover:text-red-400 w-full ${
                isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
              }`}
              title={isCollapsed ? 'Đăng xuất' : ''}
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
