import { motion } from 'framer-motion'
import AutopilotPanel from '@/components/venture/AutopilotPanel'

export default function Autopilot() {
  return (
    <motion.div
      className="mx-auto max-w-7xl px-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-zinc-100">Autopilot</h1>
        <p className="mt-1 text-sm text-zinc-500">Autonomous operations across all ventures</p>
      </div>
      <AutopilotPanel />
    </motion.div>
  )
}
