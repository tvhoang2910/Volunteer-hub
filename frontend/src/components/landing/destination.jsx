// components/Destination.js
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import "react-multi-carousel/lib/styles.css";
import Image from 'next/image';
import { CiHeart, CiCamera } from "react-icons/ci";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link";

import flights from "@/data/featuredFlights.json";

import {
  MdStar,
  MdCheck,
  MdPeopleOutline,
  MdLocationPin,
  MdArrowRightAlt,
} from "react-icons/md";
import { IoVideocamOutline } from "react-icons/io5";
import { WiTime3 } from "react-icons/wi";

// Import `Carousel` với dynamic import để tắt SSR
const Carousel = dynamic(() => import("react-multi-carousel"), { ssr: false });

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const FlightCard = ({ flight }) => (
  <Card key={flight.id} className="relative overflow-hidden group cursor-pointer h-[400px] text-left">
    {/* Flight Image */}
    <Image
      src={flight.image}
      alt={`${flight.from} đến ${flight.to}`}
      width={600}
      height={400}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
    />

    {/* Flight Position */}
    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
      {flight.position}
    </div>

    {/* Card Content */}
    <div className="absolute bottom-0 w-full h-1/2 bg-green-500/70  p-4">
      {/* Flight Info (Top Left) */}
      <div className="text-white">
        <h4 className="text-lg font-semibold">
          {flight.from} đến {flight.to}
        </h4>
        <p className="text-sm">{flight.date}</p>
      </div>

      {/* Flight Details (Bottom Right) */}
      <div className="absolute bottom-4 right-4 text-white text-right">
        <div className="text-sm">Từ</div>
        <div className="text-xl font-bold">{flight.price} VND*</div>
        <div className="text-sm">{flight.views}</div>
        <div className="text-sm">Một chiều / Phổ thông</div>
      </div>
    </div>
  </Card>
);

const Places = ({ image, country, tours, column }) => (
  <div className={`relative overflow-hidden h-[270px] lg:col-span-${column}`}>
    <Image 
      src={image} 
      alt="" 
      className="h-full w-full rounded-lg object-cover hoverImg" 
      layout="responsive" 
      width={500} 
      height={500} 
    />
    <p className="text-3xl text-white font-semibold absolute left-6 bottom-6">{country}</p>
    <button className="bg-green-500 text-white rounded-lg px-4 py-2 text-xs font-semibold absolute top-4 right-4">
      {tours} TOURS
    </button>
  </div>
);

const Tours = ({ image, name }) => (
  <div>
    <div className="relative overflow-hidden rounded-t-lg">
    <Image 
      src={image} 
      alt="" 
      className="rounded-t-lg hoverImg" 
      layout="intrinsic" 
      width={500} 
      height={300} 
    />
      <div className="absolute flex justify-between top-4 left-4 right-4">
        <p className="bg-[#14B0C3] rounded-md px-4 py-1 text-white text-sm">FEATURED</p>
        <button className="bg-[#00000066] p-1 rounded-md">
          <CiHeart className="text-white text-xl" />
        </button>
      </div>
    </div>
    <div className="border border-[#ebe6de] rounded-b-lg relative">
      <div className="absolute w-full h-5 -top-5 bg-white rounded-t-[20px]"></div>
      <div className="p-6 pt-0">
        <div className="flex items-center gap-4 justify-between">
          <span className="flex justify-center">
            {[...Array(5)].map((_, index) => (
              <MdStar key={index} className="text-[#ffa801] text-xl" />
            ))}
            <p className="text-[#757783] pl-2">4.6</p>
          </span>
          <span className="flex gap-2">
            <div className="relative">
              <CiCamera />
              <button className="bg-green-500 text-xs rounded-full text-white w-4 h-4 flex items-center justify-center absolute top-0 right-0">
                5
              </button>
            </div>
            <IoVideocamOutline size={30} />
          </span>
        </div>
        <h4 className="text-xl font-semibold py-2 hover:text-green-500">{name}</h4>
        <span className="flex items-center gap-2">
          <MdLocationPin className="text-green-500 text-xl" />
          <p className="text-[#757783] text-sm">Ha Noi, Viet Nam</p>
        </span>
        <span className="text-[#757783] flex py-4">
          From <p className="text-green-500">$59.00</p>
        </span>
        <div className="bg-[#FAF8F4] flex justify-between py-4 px-4">
          <span className="flex items-center gap-2">
            <WiTime3 className="text-green-500" /> 10 days
          </span>
          <span className="flex items-center gap-2">
            <MdPeopleOutline className="text-green-500" /> 50
          </span>
          <a href="#" className="flex items-center gap-2 text-green-500 text-sm font-bold mt-2">
            explore <MdArrowRightAlt />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default function Destination() {

  const [visibleCount, setVisibleCount] = useState(4);

  // Xử lý khi bấm nút "Xem thêm"
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  // Kiểm tra nếu đã hiển thị hết thẻ
  const isShowMoreVisible = visibleCount < flights.length;

  return (
    <div className="lg:mt-60 mt-10" data-aos="fade-down">
      
      <div className="max-w-[1200px] px-6 mx-auto text-center">
      {/* <p className="text-green-500 text-xl">Featured Flights</p> */}
      <h4 className="font-bold lg:text-[50px] text-[30px] py-4">Các sự kiện nổi bật</h4>

      {/* Flights List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flights.slice(0, visibleCount).map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>

        {/* Nút "Xem thêm" */}
        {isShowMoreVisible && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} className="bg-green-500 text-white px-6 py-2 rounded-md">
              Xem thêm
            </Button>
          </div>
        )}
    
    </div>
      
      
      <div className="bg-[url(/bg-line-bird.png)] bg-no-repeat py-16">
        <div className="lg:flex max-w-[1200px] px-6 mx-auto gap-8">
          <div className="relative lg:w-1/2" data-aos="fade-down">
          <Image 
            src="/image-6.jpg" 
            alt="Descriptive text" 
            width={500} 
            height={500} 
            priority 
          />
            <div className="absolute top-4 right-4">
              <p className="text-green-500 font-semibold text-[80px]">10%</p>
              <p className="text-[50px] font-semibold -mt-8">Giảm giá</p>
            </div>
            <button className="bg-white shadow-md px-12 py-4 absolute left-4 top-1/2 rounded-xl">
              <p className="text-gray text-xs font-medium">Đặt chuyến bay ngay</p>
              <p className="font-semibold text-lg">66888000</p>
            </button>
          </div>
          <div className="lg:w-1/2" data-aos="fade-up">
            <p className="text-green-500 text-xl">Hãy đến với chúng tôi</p>
            <h4 className="font-bold lg:text-[50px] text-[30px] py-4">Quản lý hoạt động tình nguyện của bạn dễ dàng hơn với VolunteerHub </h4>
            <p className="text-[#757783] leading-8 mb-8">
            Bạn có biết? Một hoạt động tình nguyện thành công không chỉ đến từ tấm lòng, mà còn từ cách tổ chức chuyên nghiệp.
            </p>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-green-500 text-white rounded-xl" /> Tạo và quản lý các chương trình tình nguyện của bạn
            </span>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-green-500 text-white rounded-xl" /> Theo dõi số lượng tình nguyện viên, lịch trình, và tiến độ công việc
            </span>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-green-500 text-white rounded-xl" /> Kết nối cộng đồng, lan tỏa tinh thần sẻ chia 💫
            </span>
            <div className="mt-8">
              <Link href="/">
                <button className="bg-green-500 text-white text-xs font-bold rounded-md px-8 h-12 hoverBtn">
                  TẠO SỰ KIỆN NGAY
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="text-center my-10 px-6" data-aos="fade-down">
        <p className="text-green-500 text-xl pb-2">Featured news</p>
        <h4 className="lg:text-[50px] text-[30px] font-bold">Highlighted Information</h4>
        <div className="pt-8">
          <Carousel
            partialVisible={false}
            swipeable
            draggable={false}
            responsive={responsive}
            ssr={false}
            infinite
            autoPlay
            arrows
            keyBoardControl
            itemClass="carouselItem"
          >
            <Tours image="/tour-1.jpg" name="Ha Noi to Ho Chi Minh city" />
            <Tours image="/tour-2.jpg" name="Ha Noi to Da Nang city" />
            <Tours image="/tour-3.jpg" name="Ha Noi to Da Lat" />
            <Tours image="/tour-4.jpg" name="Ha Noi to Hue" />
            <Tours image="/tour-5.jpg" name="Ha Noi to Bangkok" />
          </Carousel>
        </div>
      </div> */}
    </div>
  );
}
