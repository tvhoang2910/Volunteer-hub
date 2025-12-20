import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SlideUpDetail({ isOpen, onClose, title, description, children, className, variant = "default" }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay mờ nền */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel trượt lên */}
                    <motion.div
                        className={cn(
                            variant === "phone"
                                ? "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-white rounded-t-2xl shadow-lg h-[100vh] w-full max-w-[420px] flex flex-col"
                                : "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg max-h-[85vh] flex flex-col",
                            className
                        )}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center p-6 pb-4 border-b flex-none">
                            <div>
                                <h2 className="text-xl font-semibold">{title}</h2>
                                {description && (
                                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 pt-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
