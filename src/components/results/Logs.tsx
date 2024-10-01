"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Logs({ logs }: { logs: string[] }) {
  const controls = useAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [totalResult, setTotalResult] = useState<number | null>(null);

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

  useEffect(() => {
    logs.forEach((log) => {
      const totalMatch = log.match(/Total\s*:\s*(\d+)/);
      if (totalMatch) {
        const newTotal = parseInt(totalMatch[1], 10);
        setTotalResult(newTotal);
      }
    });
  }, [logs]);

  return (
    
      <ul className="space-y-2 pt-4 h-full flex flex-col font-mono rounded-lg max-w-3xl mx-auto">
        {logs
          .filter((log) => !log.startsWith("Total"))
          .map((log, index) => (
            <motion.li
              key={index}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              className={`flex items-center ${
                index === logs.length - 1 ? "animate-pulse" : ""
              }`}
            >
              <span className="text-yellow-500 mr-2 ">$</span>
              <span className="text-sm ">{log}</span>
            </motion.li>
          ))}

        {totalResult !== null && (
          <motion.li
            custom={logs.length}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className="flex items-center animate-pulse"
          >
            <span className="text-yellow-500 mr-2">$</span>
            <span className="text-sm">Total: {totalResult}</span>
          </motion.li>
        )}
      </ul>

  );
}
