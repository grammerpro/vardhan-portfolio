'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  {
    number: '50+',
    label: 'Projects Completed',
    icon: '🚀',
    color: 'from-sky-500 to-blue-600',
    description: 'Delivered innovative solutions'
  },
  {
    number: '5+',
    label: 'Years Experience',
    icon: '💼',
    color: 'from-cyan-500 to-teal-600',
    description: 'Building digital experiences'
  },
  {
    number: '100%',
    label: 'Client Satisfaction',
    icon: '⭐',
    color: 'from-emerald-500 to-green-600',
    description: 'Exceeding expectations'
  },
  {
    number: '15+',
    label: 'Happy Clients',
    icon: '🤝',
    color: 'from-indigo-500 to-purple-600',
    description: 'Trusted partnerships'
  }
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={sectionRef} className="relative w-full py-20 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20 snap-start overflow-hidden">
      {/* Parallax background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-20"
      >
        <div className="absolute top-10 left-10 w-32 h-32 bg-sky-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My Impact in Numbers
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Delivering exceptional results through creativity and technical excellence
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Icon */}
                <motion.div
                  className="text-4xl mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {stat.icon}
                </motion.div>

                {/* Number with counter animation */}
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15 + 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {stat.number}
                </motion.div>

                {/* Label */}
                <div className="text-gray-700 font-semibold mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-gray-500 text-sm font-light">
                  {stat.description}
                </div>

                {/* Subtle floating elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-sky-400 rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6 text-lg">
            Ready to be part of these success stories?
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-sky-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-sky-600"
          >
            Start Your Project
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
