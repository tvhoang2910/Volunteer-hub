import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { LayoutDashboard, Plane, CalendarDays, User, Users, UserPen, FileText, TicketCheck, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

const navItems = [
  {
    name: 'Tổng quan',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Quản lý sự kiện',
    href: '/admin/eventManage',
    icon: CalendarDays
  },
  {
    name: 'Quản lý thành viên',
    href: '/admin/customers',
    icon: Users
  },
  {
    name: 'Quản lý admin',
    href: '/admin/members',
    icon: UserPen
  },
  {
    name: 'Hồ sơ cá nhân',
    href: '/admin/profile',
    icon: User
  },
  {
    name: 'Dashboard',
    href: '/admin/events',
    icon: User
  }
]

export default function Navbar({ onCollapse }) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-500 rounded">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">Volunteer Hub</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-zinc-900 text-zinc-400 shadow-2xl border-r border-zinc-800 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${router.pathname === item.href
                ? 'bg-green-500/10 text-green-500'
                : 'text-white hover:bg-green-500/10 hover:text-green-500'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block h-screen bg-zinc-900 text-zinc-400 shadow-2xl border-r border-zinc-800/50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        }`}>
        <div className={`border-b border-zinc-800/50 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'
          }`}>
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-lg font-bold text-white tracking-tight transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
              Volunteer Hub
            </h1>
          </div>
          {/* Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="mt-4 w-full flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300 group"
            aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
        <nav className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'
          }`}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center rounded-xl text-sm font-medium
                transition-all duration-300 ease-out overflow-hidden
                ${isCollapsed
                  ? 'justify-center px-2 py-3'
                  : 'gap-3 px-4 py-3'
                }
                ${router.pathname === item.href
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 shadow-lg shadow-green-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
              title={isCollapsed ? item.name : ''}
            >
              {/* Active indicator bar */}
              <div className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full
                transition-all duration-300
                ${router.pathname === item.href ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
              `} />

              {/* Icon with glow effect */}
              <div className={`
                relative z-10 transition-all duration-300
                ${router.pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}
              `}>
                <item.icon className={`
                  w-5 h-5 transition-all duration-300
                  ${router.pathname === item.href ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''}
                `} />
              </div>

              {/* Text */}
              <span className={`relative z-10 transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                {item.name}
              </span>

              {/* Shimmer effect on hover */}
              <div className={`
                absolute inset-0 -translate-x-full group-hover:translate-x-full
                bg-gradient-to-r from-transparent via-white/5 to-transparent
                transition-transform duration-1000 ease-in-out
                ${router.pathname === item.href ? 'hidden' : ''}
              `} />
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}