import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Cinematic({ show, title, subtitle, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: [0.7, 1.05, 1] }}
            transition={{ duration: 0.9 }}
            className="text-center px-4"
          >
            {children ? <div className="mb-3 flex items-center justify-center">{children}</div> : null}
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-yellow-200 to-cyan-300 drop-shadow">
              {title}
            </div>
            {subtitle ? <div className="mt-2 text-white/80">{subtitle}</div> : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
