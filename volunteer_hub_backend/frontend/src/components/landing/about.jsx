// components/About.js
import { FaPlay } from "react-icons/fa";
import { FaPlaneDeparture } from 'react-icons/fa';
import { MdFlight } from 'react-icons/md';
import { GiPriceTag } from 'react-icons/gi';
import { AiOutlineCheckCircle } from 'react-icons/ai'
import Image from 'next/image';

export default function About() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section với Gradient Overlay */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 py-24 w-full overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Background Image với Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: 'url(/bg-1.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-teal-800/80 to-cyan-900/80"></div>

        <div className="relative lg:flex gap-12 max-w-[1200px] px-6 mx-auto z-10">
          {/* Left Content */}
          <div className="lg:w-1/2 w-full">
            <span data-aos="fade-up-right" className="block">
              <button className="group relative rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 w-24 h-24 flex justify-center items-center mb-8 shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 transition-all duration-300 hover:scale-110 hover:rotate-3">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 animate-pulse opacity-75"></div>
                <FaPlay className="text-white text-2xl relative z-10 group-hover:scale-125 transition-transform duration-300" />
              </button>
              <p className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent text-xl font-semibold pb-2 drop-shadow-lg">
                Bạn đã sẵn sàng để tham gia tình nguyện chưa ?
              </p>
            </span>
            <p
              className="lg:text-[50px] leading-normal text-2xl font-bold text-white lg:pb-0 pb-4 drop-shadow-2xl"
              data-aos="fade-up-right"
            >
              VolunteerHub là nền tảng quản lý tình nguyện hàng đầu tại Việt Nam
            </p>
          </div>

          {/* Right Cards Grid */}
          <div
            className="grid md:grid-cols-2 grid-cols-1 gap-4 lg:gap-6"
            data-aos="fade-up-right"
          >
            <div
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col items-center gap-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20"
              data-aos="fade-down-right"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-500"></div>
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FaPlaneDeparture className="text-white text-3xl" />
              </div>
              <p className="text-white text-xl font-semibold relative z-10 text-center group-hover:text-emerald-100 transition-colors duration-300">
                Tạo sự kiện
              </p>
            </div>

            <div
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col items-center gap-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20"
              data-aos="fade-down-right"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-500"></div>
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <MdFlight className="text-white text-3xl" />
              </div>
              <p className="text-white text-xl font-semibold relative z-10 text-center group-hover:text-emerald-100 transition-colors duration-300">
                Khám phá hoạt động
              </p>
            </div>

            <div
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col items-center gap-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20"
              data-aos="fade-down-right"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-500"></div>
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <GiPriceTag className="text-white text-3xl" />
              </div>
              <p className="text-white text-xl font-semibold relative z-10 text-center group-hover:text-emerald-100 transition-colors duration-300">
                Theo dõi tiến độ
              </p>
            </div>

            <div
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col items-center gap-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20"
              data-aos="fade-down-right"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-500"></div>
              <div className="relative z-10 p-4 rounded-full bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <AiOutlineCheckCircle className="text-white text-3xl" />
              </div>
              <p className="text-white text-xl font-semibold relative z-10 text-center group-hover:text-emerald-100 transition-colors duration-300">
                Kết nối cộng đồng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section với Gradient Background */}
      <div
        className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-[100px] overflow-hidden"
        data-aos="fade-down"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url(/bg-line.png)] bg-contain bg-bottom bg-no-repeat opacity-20"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-700/50 via-transparent to-teal-600/50"></div>

        <div className="relative flex lg:flex-nowrap flex-wrap justify-between gap-16 max-w-[1200px] xl:px-0 px-6 mx-auto z-10">
          <p className="text-[40px] font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-lg whitespace-pre">
            Đối tác của chúng tôi
          </p>
          <div className="flex flex-wrap gap-8 justify-between w-full">
            <div className="group relative p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <Image 
                src="/vietnam_airline.png" 
                alt="vietnam airline logo" 
                width={300} 
                height={300} 
                loading="lazy"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="group relative p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <Image 
                src="/vietjet.png" 
                alt="vietjet logo" 
                width={300} 
                height={300} 
                loading="lazy"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="group relative p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <Image 
                src="/china_airline.png" 
                alt="china airline logo" 
                width={300} 
                height={300} 
                loading="lazy"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="group relative p-6 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <Image 
                src="/hongkong_airline.png" 
                alt="hongkong airline logo" 
                width={300} 
                height={300} 
                loading="lazy"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
