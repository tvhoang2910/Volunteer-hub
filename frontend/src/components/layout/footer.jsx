// components/Footer.js
import {
  MdPhone,
  MdOutlineMailOutline,
  MdOutlineLocationOn,
} from "react-icons/md";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-emerald-800 via-teal-700 to-sky-900 py-16 text-[#E8F6F3]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/logo-white.png" alt="Logo" width={56} height={56} />
              <span className="text-xl font-semibold tracking-tight">Volunteer Hub</span>
            </div>
            <p className="text-sm text-[#CFCFDF]">Chào mừng đến với Volunteer Hub. Chúng tôi cung cấp nền tảng quản lý tình nguyện hàng đầu tại Việt Nam.</p>

            <div className="pt-3 border-t border-emerald-200/10 space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-[#E8E8F0] hover:text-white transition-colors">
                <MdPhone className="text-emerald-300" /> <span className="ml-1">+84 123 456 789</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-[#E8E8F0] hover:text-white transition-colors">
                <MdOutlineMailOutline className="text-emerald-300" /> <span className="ml-1">Volunteer Hub-support@Volunteer Hub.website</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-[#E8E8F0] hover:text-white transition-colors">
                <MdOutlineLocationOn className="text-emerald-300" />
                <span className="ml-1">Nhà E3, 144 Xuân Thủy, quận Cầu Giấy, Hà Nội, Việt Nam</span>
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h6 className="text-white text-lg font-semibold mb-4">Công ty</h6>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog cộng đồng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Phần thưởng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Làm việc với chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Discover links */}
          <div>
            <h6 className="text-white text-lg font-semibold mb-4">Khám phá</h6>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tài khoản</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chương trình liên kết</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Đối tác của chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sự kiện</a></li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-4">
            <h6 className="text-white text-lg font-semibold">Nhận tin tức</h6>
            <p className="text-sm text-[#CFCFDF]">Nhận thông tin khuyến mãi, mã giảm giá và tin tức mới nhất từ Volunteer Hub.</p>

            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                aria-label="Email"
                placeholder="Hòm thư điện tử"
                className="flex-1 bg-white/6 placeholder:text-[#D1D1E0] text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 transition-shadow"
              />
              <button
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg hover:scale-[1.02] transform transition-transform"
                type="submit"
              >
                ĐĂNG KÝ
              </button>
            </form>

            <label className="flex items-center gap-2 text-xs text-[#CFCFDF]">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/6 focus:ring-2 focus:ring-emerald-300/60" />
              Tôi đồng ý với tất cả các điều khoản và chính sách
            </label>

            <div className="pt-3 border-t border-emerald-200/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 rounded-full bg-white/6 hover:bg-emerald-600/20 transition-transform hover:scale-105">
                  <FaFacebookF className="text-emerald-100" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/6 hover:bg-emerald-600/20 transition-transform hover:scale-105">
                  <FaTwitter className="text-emerald-100" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/6 hover:bg-emerald-600/20 transition-transform hover:scale-105">
                  <FaInstagram className="text-emerald-100" />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/6 hover:bg-emerald-600/20 transition-transform hover:scale-105">
                  <FaLinkedinIn className="text-emerald-100" />
                </a>
              </div>

              <div className="text-xs text-[#BFE9DA]">© {new Date().getFullYear()} Volunteer Hub. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
