import React from "react";
import { FaHandHoldingHeart, FaChartLine } from "react-icons/fa";

const features = [
    {
        icon: <FaHandHoldingHeart className="w-6 h-6 text-emerald-600" />,
        title: "Seamless Connection",
        description:
            "Effortlessly connect passionate volunteers with meaningful opportunities that match their skills and interests.",
        bg: "bg-emerald-100",
    },
    {
        icon: <FaChartLine className="w-6 h-6 text-blue-600" />,
        title: "Impact Tracking",
        description:
            "Monitor real-time statistics, track volunteer hours, and visualize the collective impact of your community events.",
        bg: "bg-blue-100",
    },
];

function Feature() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-transparent">
            <div className="max-w-7xl px-6 mx-auto lg:px-12">
                {/* Header */}
                <div
                    className="max-w-3xl mx-auto text-center"
                    data-aos="fade-down"
                    data-aos-duration="1000"
                >
                    <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase font-pj">
                        Why Choose Us
                    </p>
                    <h2 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            maximize social impact
                        </span>
                    </h2>
                </div>

                {/* Content */}
                <div className="grid items-center gap-12 mt-16 lg:grid-cols-5">
                    {/* Features List */}
                    <div className="space-y-8 lg:col-span-2">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group flex items-start gap-5 p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1"
                                data-aos="fade-right"
                                data-aos-delay={idx * 150}
                            >
                                <div className="shrink-0">
                                    <div
                                        className={`w-14 h-14 flex items-center justify-center rounded-xl ${feature.bg} group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        {feature.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-gray-600 text-base leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Image Section */}
                    <div
                        className="lg:col-span-3 relative"
                        data-aos="fade-left"
                        data-aos-duration="1200"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-teal-200 rounded-2xl transform rotate-3 blur-lg opacity-50"></div>
                        <img
                            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
                            alt="Volunteers working together"
                            className="relative w-full rounded-2xl shadow-2xl object-cover transform transition-transform duration-500 hover:scale-[1.02]"
                        />

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                            <div className="bg-green-100 p-2 rounded-full">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Volunteers</p>
                                <p className="text-xl font-bold text-gray-900">5,000+</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Feature;
