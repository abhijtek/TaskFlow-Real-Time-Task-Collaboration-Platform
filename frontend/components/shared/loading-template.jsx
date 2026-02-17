import { motion } from "framer-motion";

export default function LoadingTemplate() {
  const cards = [
    { width: "w-40", height: "h-24" },
    { width: "w-48", height: "h-32" },
    { width: "w-36", height: "h-28" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-3 bg-secondary/12 rounded-lg p-4 border border-accent/12">
        <motion.div
          className="h-3 w-24 rounded-full bg-gradient-to-r from-primary/18 to-accent/18"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="h-2 w-full rounded-full bg-accent/10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
      </div>

      {/* Content skeleton grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className={`${card.width} ${card.height} rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/12 p-4 space-y-2`}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
          >
            <motion.div
              className="h-2 w-3/4 rounded-full bg-primary/18"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="h-2 w-1/2 rounded-full bg-accent/14"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div
              className="h-2 w-2/3 rounded-full bg-primary/12"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Bottom skeleton */}
      <div className="space-y-2 bg-accent/4 rounded-lg p-4 border border-accent/10">
        <motion.div
          className="h-2 w-full rounded-full bg-primary/14"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="h-2 w-5/6 rounded-full bg-accent/12"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
