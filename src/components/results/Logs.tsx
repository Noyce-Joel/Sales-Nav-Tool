"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Logs({ logs }: { logs: string[] }) {
  const controls = useAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }));

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, controls]);

  return (
    <div className="font-mono rounded-lg  max-w-3xl mx-auto">
      
      <div
        ref={scrollRef}
        className=" flex "
      >
        <ul className="space-y-2 pt-4">
          {logs.map((log, index) => (
            <motion.li
              key={index}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              className={`flex items-start ${
                index === logs.length - 1 ? "animate-pulse" : ""
              }`}
            >
              <span className="text-yellow-500 mr-2">$</span>
              <span>{log}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
