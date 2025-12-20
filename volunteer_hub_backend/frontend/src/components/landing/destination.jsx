// components/Destination.js
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import flights from "@/data/featuredFlights.json";
import { MdLocationOn, MdAccessTime, MdArrowForward } from "react-icons/md";

const EventCard = ({ event, index }) => (
  <div
    className="group relative h-[420px] w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl"
    data-aos="fade-up"
    data-aos-delay={index * 100}
  >
    {/* Image Background */}
    <div className="absolute inset-0 h-full w-full">
      <Image
        src={event.image}
        alt={`${event.from} to ${event.to}`}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
    </div>

    {/* Badge */}
    <div className="absolute top-4 right-4 z-10">
      <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
        {event.position || "Featured"}
      </span>
    </div>

    {/* Content */}
    <div className="absolute bottom-0 left-0 w-full p-6 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
      {/* Date & Location */}
      <div className="flex items-center gap-4 text-sm text-gray-300 mb-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 delay-100">
        <span className="flex items-center gap-1">
          <MdAccessTime className="text-emerald-400" />
          {event.date}
        </span>
        <span className="flex items-center gap-1">
          <MdLocationOn className="text-emerald-400" />
          {event.from}
        </span>
      </div>

      <h3 className="text-2xl font-bold leading-tight mb-2 text-white group-hover:text-emerald-300 transition-colors">
        {event.to}
      </h3>

      <p className="text-sm text-gray-300 line-clamp-2 mb-4 opacity-90">
        Discover meaningful volunteer opportunities in {event.to}. Join us to make a difference.
      </p>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Target Goal</span>
          <span className="text-lg font-bold text-emerald-400">{event.price} VND</span>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 group-hover:gap-3">
          Join Now <MdArrowForward />
        </button>
      </div>
    </div>
  </div>
);

export default function Destination() {
  const [visibleCount, setVisibleCount] = useState(4);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const isShowMoreVisible = visibleCount < flights.length;

  return (
    <div className="py-20 lg:py-28 relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl px-6 mx-auto">

        {/* Header Section */}
        <div className="text-center mb-16 space-y-4" data-aos="fade-down">
          <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase font-pj">
            Explore Opportunities
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Events</span>
          </h3>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            Find and participate in events that matter. Connect, contribute, and grow with our community.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {flights.slice(0, visibleCount).map((flight, index) => (
            <EventCard key={flight.id} event={flight} index={index} />
          ))}
        </div>

        {/* Show More Button */}
        {isShowMoreVisible && (
          <div className="text-center mt-12" data-aos="fade-up">
            <Button
              onClick={handleShowMore}
              variant="outline"
              className="group border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              See More Events
              <MdArrowForward className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
