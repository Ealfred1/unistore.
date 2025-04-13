"use client"

import { motion } from "framer-motion"
import { Users } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up with your university email and set up your profile in just a few minutes.",
  },
  {
    number: "02",
    title: "Browse or List Products",
    description: "Explore products from fellow students or list your own items for sale with just a few clicks.",
  },
  {
    number: "03",
    title: "Connect and Transact",
    description: "Chat with buyers or sellers, negotiate prices, and complete secure transactions.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
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
              className="inline-block rounded-lg bg-[#f58220]/10 px-3 py-1 text-sm text-[#f58220]"
            >
              How It Works
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              Simple & Easy to Use
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Get started in minutes and experience the future of university commerce.
            </motion.p>
          </div>
        </motion.div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 items-center mt-12">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex gap-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#0a2472] text-white font-bold"
                >
                  {step.number}
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-500">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              whileInView={{ rotate: -3, scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-br from-[#f58220]/20 to-[#0a2472]/20 rounded-2xl"
            ></motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative bg-white rounded-2xl shadow-sm overflow-hidden border"
            >
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#0a2472]" />
                    </div>
                    <div>
                      <h4 className="font-medium">University Community</h4>
                      <p className="text-sm text-gray-500">Connect with fellow students</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.6 + item * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-2.5 w-24 bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-16 bg-gray-200 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="h-6 w-16 bg-[#f58220]/20 rounded-full"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
