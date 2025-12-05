import React from 'react'
import Link from 'next/link'
import { MoveLeft, Plane, HandHeart } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Custom404() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Icon/Graphic */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
          <div className="relative bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
            <HandHeart className="w-16 h-16 text-green-500 rotate-[-45deg]" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-zinc-400 max-w-md mb-8 text-lg">
          Có vẻ như trang bạn đang tìm kiếm không tồn tại
        </p>

        {/* Action Button */}
        <Link href="/" passHref>
          <Button
            className="group relative px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-green-500/40 border-0"
          >
            <MoveLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold text-lg">Quay về trang chủ</span>
          </Button>
        </Link>
      </div>

      {/* Footer/Copyright */}
      <div className="absolute bottom-8 text-zinc-600 text-sm">
        ©Volunteer Hub
      </div>
    </div>
  )
}
