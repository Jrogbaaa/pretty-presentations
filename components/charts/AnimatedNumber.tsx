import { useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

const AnimatedNumber = ({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  delay = 0
}: AnimatedNumberProps) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    delay,
    config: { duration }
  });

  return (
    <animated.span className={className}>
      {number.to(n => `${prefix}${n.toFixed(decimals)}${suffix}`)}
    </animated.span>
  );
};

export default AnimatedNumber;

