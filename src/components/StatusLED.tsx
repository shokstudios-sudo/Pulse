import { motion } from "framer-motion";

interface StatusLEDProps {
  status: 'up' | 'down' | 'slow';
  size?: number;
}

const statusClasses = {
  up: "bg-status-up led-glow-up",
  down: "bg-status-down led-glow-down",
  slow: "bg-status-slow led-glow-slow",
};

const StatusLED = ({ status, size = 6 }: StatusLEDProps) => {
  return (
    <motion.div
      className={`rounded-full ${statusClasses[status]}`}
      style={{ width: size, height: size }}
      animate={status === 'up' ? { scale: [1, 1.2, 1] } : undefined}
      transition={status === 'up' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
    />
  );
};

export default StatusLED;
