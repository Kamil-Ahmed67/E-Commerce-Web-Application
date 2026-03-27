'use client';

import Image from 'next/image';
import { motion } from "framer-motion";

const categories = [
  { title: "Mingle", image: "/images/m-1.jpg", logo: "/images/logo/4.png", link: "/shop?brand=MINGLE" },
  { title: "Pure North", image: "/images/PureNorth.jpg", logo: "/images/logo/1.png", link: "/shop?brand=PureNorth" },
  { title: "Vidjar", image: "/images/Cat-2.jpg", logo: "/images/logo/2.png", link: "/shop?brand=VIDJAR" },
  { title: "Avasa", image: "/images/Avasa.jpeg", logo: "/images/logo/3.png", link: "/shop?brand=AVASAA" },
];

export default function CategoriesSection() {
  return (
    <section className='bg-white border-gray-300 px-5 pt-4 pb-6 '>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((item, index) => (
          <motion.a
            href={item.link}
            key={index}
            transition={{ duration: 0.3 }}
          >
            <div className="shadow-md">
              <div className="w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={800}
                  height={1000}
                  className="w-full h-auto transition-transform duration-500"
                  priority={index < 2}
                />
              </div>

              <div className="bg-white h-19 md:h-23 flex items-center justify-center border-t border-gray-100 px-4">
                <div className="relative w-27 h-13 md:w-31 md:h-15 transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={item.logo}
                    alt={`${item.title} logo`}
                    fill
                    className="object-contain"
                    sizes="125px"
                    quality={90}
                  />
                </div>
              </div>
            </div>


          </motion.a>
        ))}
      </div>
    </section>
  );
}