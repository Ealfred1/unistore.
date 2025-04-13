"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "UniStore made it so easy to sell my old textbooks and find the ones I needed for the new semester. Saved me a lot of money!",
    name: "Sarah Johnson",
    role: "Computer Science, Year 3",
    rating: 5,
  },
  {
    quote:
      "I requested a specific calculator model for my engineering class, and within hours I had multiple offers. The platform is amazing!",
    name: "Michael Chen",
    role: "Mechanical Engineering, Year 2",
    rating: 5,
  },
  {
    quote:
      "As a student entrepreneur, UniStore has been the perfect platform to reach other students with my products. The community is supportive!",
    name: "Olivia Martinez",
    role: "Business Administration, Year 4",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block rounded-lg bg-[#0a2472]/10 px-3 py-1 text-sm text-[#0a2472]"
            >
              Testimonials
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              What Students Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Hear from students who have transformed their university experience with{" "}
              <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>.
            </motion.p>
          </div>
        </motion.div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col justify-between rounded-lg border p-6 bg-white shadow-sm"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex"
                >
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 + i * 0.05 }}
                    >
                      <Star className="h-5 w-5 fill-[#f58220] text-[#f58220]" />
                    </motion.div>
                  ))}
                </motion.div>
                <p className="text-gray-500 italic">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
