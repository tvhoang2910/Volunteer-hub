import React from "react";
import { FaUsers, FaHandHoldingHeart, FaClock, FaGlobeAsia } from "react-icons/fa";

const stats = [
    {
        icon: FaUsers,
        value: "50k+",
        label: "Active Volunteers",
        color: "text-blue-500",
        bg: "bg-blue-100"
    },
    {
        icon: FaHandHoldingHeart,
        value: "1,200+",
        label: "Events Organized",
        color: "text-emerald-500",
        bg: "bg-emerald-100"
    },
    {
        icon: FaClock,
        value: "2.5M+",
        label: "Hours Contributed",
        color: "text-purple-500",
        bg: "bg-purple-100"
    },
    {
        icon: FaGlobeAsia,
        value: "50+",
        label: "Partner Communities",
        color: "text-orange-500",
        bg: "bg-orange-100"
    },
];

const Stat = () => {
    return (
        <section className="py-16 sm:py-24 bg-transparent relative overflow-hidden">

            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
                <div
                    className="max-w-2xl mx-auto text-center"
                    data-aos="fade-down"
                >
                    <h2 className="text-3xl font-bold font-pj sm:text-4xl xl:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Making a real <span className="text-emerald-600">Impact</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 font-medium">
                        Together, we are building a stronger, more connected community through millions of hours of service.
                    </p>
                </div>

                <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto mt-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="relative group bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                            data-aos="fade-up"
                            data-aos-delay={index * 150}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${stat.bg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>

                                <h3 className="text-4xl font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    {stat.value}
                                </h3>
                                <p className="mt-2 text-base font-medium text-gray-600 uppercase tracking-wide">
                                    {stat.label}
                                </p>
                            </div>

                            {/* Decor corners */}
                            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stat;