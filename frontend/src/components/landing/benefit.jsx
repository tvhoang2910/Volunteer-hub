// components/Benefit.js
import dynamic from "next/dynamic";
import {
  MdArrowCircleRight,
  MdPerson,
} from "react-icons/md";
import { RiFlightTakeoffFill } from "react-icons/ri";
import { GiRuleBook } from "react-icons/gi";
import "react-multi-carousel/lib/styles.css";
import Link from "next/link";
import { HomeNewsCard } from "./NewsCards";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// Import `Carousel` với dynamic import để tắt SSR


const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
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

export default function Benefit() {
  const router = useRouter()
  const [featuredArticles, setFeaturedArticles] = useState([])

  useEffect(() => {
    getAllNews()
  }, [router]);

  const getAllNews = async () => {
    const getAllNewsApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}GET /api/news?page=1&limit=10`

    try {
      const response = await fetch(getAllNewsApi, {
        method: "GET",
      })
      if (!response.ok) {
        throw new Error("Send request failed")
      }

      const res = await response.json()

      setFeaturedArticles(res.map(a => {
        return {
          "slug": a.newsId,
          "image": a.image,
          "title": a.title,
          "description": a.description,
          "author": a.authorId,
          "content": a.content,
          "date": a.createAt.seconds ? new Date(a.arrival_time).toISOString().replace("T", " ").slice(0, -5) : a.createAt.split('T')[0],
          "buttonText": "Đọc thêm",
          "authorTitle": "Nhà báo",
          "authorImage": "/AvatarUser/no_avatar.jpg",
        }
      }))

    } catch (error) {
      // alert("Đã xảy ra lối, vui lòng thử lại(fixed)")
    }
  }
  return (
    <div>
      {/* Phần giới thiệu */}
      <section className="lg:flex">
        <div className="lg:w-[45%]" data-aos="fade-down">
          <Image
            src="/bg-2.jpg"
            alt="Background"
            width={1000}
            height={900}
            className="h-full"
          />
        </div>
        <div className="relative lg:w-[55%] bg-[url(/bg-map-2.png)] bg-[#313041] bg-right-bottom bg-contain flex flex-col justify-center py-16">
          <div className="absolute lg:w-3 w-0 bg-green-500 left-0 rounded-r-[10px] top-[120px] bottom-[120px]"></div>
          <div className="lg:w-[55%] lg:pl-24 px-6">
            <p className="text-xl text-green-500" data-aos="fade-up">Danh sách lợi ích của chúng tôi</p>
            <h4 className="text-white lg:text-[50px] text-[30px] py-4" data-aos="fade-up">Tại sao chọn VolunteerHub</h4>
            <p className="text-gray leading-8" data-aos="fade-down">
              Chúng tôi tự hào mang đến nền tảng hỗ trợ quản lý hoạt động tình nguyện toàn diện, giúp các bản, xã và cộng đồng dễ dàng tổ chức, theo dõi và đánh giá mọi chương trình một cách hiệu quả – minh bạch – bền vững.
              Với VolunteerHub, mọi công tác tình nguyện trở nên đơn giản, hiện đại và kết nối hơn bao giờ hết.
            </p>

            {/* Các lợi ích */}
            <div className="flex lg:flex-row flex-col items-center gap-8 pt-16" data-aos="fade-up">
              <span>
                <RiFlightTakeoffFill className="text-green-500 text-5xl" />
              </span>
              <span>
                <h6 className="text-white text-xl">Chuyên nghiệp và đáng tin cậy</h6>
                <p className="text-gray leading-8 py-4">
                  Chúng tôi đồng hành cùng các tổ chức, trưởng bản và nhóm tình nguyện trên khắp cả nước.
                  Hệ thống được thiết kế bài bản và an toàn, đảm bảo dữ liệu của bạn luôn được bảo mật.
                  Đội ngũ hỗ trợ tận tâm 24/7 sẵn sàng giúp bạn giải quyết mọi khó khăn trong quá trình sử dụng.
                </p>
              </span>
            </div>
            <div className="flex lg:flex-row flex-col items-center gap-8 pt-6" data-aos="fade-up">
              <span>
                <GiRuleBook className="text-green-500 text-5xl" />
              </span>
              <span>
                <h6 className="text-white text-xl">Kết nối và lan tỏa</h6>
                <p className="text-gray leading-8 py-4">
                  VolunteerHub không chỉ là công cụ, mà còn là cầu nối giữa con người và cộng đồng.
                  Hãy để mỗi hoạt động thiện nguyện trở thành một hành trình sẻ chia – được tổ chức tốt hơn, minh bạch hơn và lan tỏa xa hơn.
                </p>
              </span>
            </div>
          </div>
        </div>
      </section>



      {/* Phần tham gia thành viên */}
      <div className="bg-[#faf5ee]" data-aos="fade-down">
        <div className="flex flex-wrap max-w-[1200px] xl:px-0 px-6 mx-auto lg:pt-28 pt-14">
          <div className="lg:w-1/2">
            <p className="text-xl text-green-500 pb-4">Tham gia với chúng tôi</p>
            <p className="lg:text-[50px] text-3xl text-textColor font-semibold">
              Bạn đã là thành viên chưa?
            </p>
            <p className="text-[#757783] py-4">
              Tham gia với chúng tôi! Các thành viên của chúng tôi có thể tiết kiệm lên đến 50%.
            </p>
            <div className="flex gap-4 pt-6">
              <Link href="/login">
                <button className="bg-green-500 text-white text-xs font-bold rounded flex gap-2 px-8 h-12 items-center hoverBtn hover:bg-green-500 hover:text-textColor">
                  <MdArrowCircleRight size={20} /> &nbsp;ĐĂNG NHẬP&nbsp;
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-white text-textColor text-xs font-bold rounded flex gap-2 px-8 h-12 items-center hoverBtn hover:bg-green-500">
                  <MdPerson size={20} /> ĐĂNG KÝ
                </button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full lg:mt-0 mt-14">
            <Image
              src="/image-app.png"
              alt="Image description"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>
      </div>

    </div>
  );
}
