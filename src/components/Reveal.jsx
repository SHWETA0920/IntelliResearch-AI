import { motion } from "framer-motion";

/**
 * Wraps children in a fade+rise animation that triggers once, when the
 * element scrolls into view. Used consistently across the app instead of
 * each page rolling its own scroll-animation logic.
 *
 * Usage: <Reveal><h2>Heading</h2></Reveal>
 * Usage with stagger: <Reveal delay={0.1}>...</Reveal>
 */
function Reveal({ children, delay = 0, y = 24, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;