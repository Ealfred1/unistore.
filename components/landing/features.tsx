"use client"

import { motion } from "framer-motion"
import { ShoppingBag, Users, Shield } from "lucide-react"

const features = [
  {
    icon: <ShoppingBag className="h-10 w-10 text-[#f58220]" />,
    title: "Buy & Sell",
    description: "Easily list items for sale or find what you need from fellow students.",
  },
  {
    icon: <Users className="h-10 w-10 text-[#f58220]" />,
    title: "University Network",
    description: "Connect with students from your university in a safe, verified community.",
  },
  {
    icon: <Shield className="h-10 w-10 text-[#f58220]" />,
    title: "Secure Transactions",
    description: "Our platform ensures safe and transparent transactions between users.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
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
              Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              Everything You Need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Discover the tools and features that make <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span> the perfect marketplace for university students.
            </motion.p>
          </div>
        </motion.div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center space-y-4 rounded-lg border-gray-300 p-6 bg-white shadow-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="p-3 rounded-full bg-[#f58220]/10"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-500 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
