import React from "react";

const logos = [
    {
        src: "https://www.auraui.com/logos/logo21.svg",
        alt: "Vertex Logo",
    },
    {
        src: "https://www.auraui.com/logos/logo20.svg",
        alt: "Squarestone Logo",
    },
    {
        src: "https://www.auraui.com/logos/logo22.svg",
        alt: "Martino Logo",
    },
    {
        src: "https://www.auraui.com/logos/logo24.svg",
        alt: "Waverio Logo",
    },
];

function LogoCloud() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="xl:flex xl:items-center xl:justify-between gap-12">
                    <div
                        className="xl:w-1/3"
                        data-aos="fade-right"
                        data-aos-duration="1000"
                    >
                        <h2 className="text-3xl font-bold bg-clip-text text-black bg-gradient-to-r from-gray-700 to-gray-500 font-pj text-center xl:text-left leading-tight">
                            Trusted by <span className="text-emerald-600">1000+</span> organizations worldwide
                        </h2>
                        <p className="mt-4 text-gray-500 text-center xl:text-left text-sm font-medium">
                            Join the community of volunteers and organizations making a difference.
                        </p>
                    </div>

                    <div className="xl:w-2/3 mt-12 xl:mt-0">
                        <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-4 items-center justify-items-center">
                            {logos.map((logo, index) => (
                                <div
                                    key={index}
                                    className="relative group w-full flex justify-center items-center p-4 transition-all duration-300"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 150}
                                    data-aos-duration="800"
                                >
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 -z-10 transform scale-75 group-hover:scale-100" />

                                    <img
                                        className="relative object-contain h-10 sm:h-12 w-auto filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-md"
                                        src={logo.src}
                                        alt={logo.alt}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LogoCloud;
