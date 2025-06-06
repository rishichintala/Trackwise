import { motion } from 'motion/react';

export default function SummaryCard({ title, value }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow p-4 flex flex-col gap-1"
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </motion.div>
  );
}
