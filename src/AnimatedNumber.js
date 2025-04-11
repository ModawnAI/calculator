import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Helper component to animate numbers
export const AnimatedNumber = ({ value, formatter }) => {
    const ref = useRef(null);
    const previousValueRef = useRef(value); // Store previous value

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const previousValue = typeof previousValueRef.current === 'number' ? previousValueRef.current : 0;
        const targetValue = typeof value === 'number' ? value : 0;

        const controls = animate(previousValue, targetValue, {
            duration: 0.5, // Animation duration
            onUpdate(latest) {
                if (node) {
                    node.textContent = formatter(latest);
                }
            }
        });
        
        // Update previous value for next render
        previousValueRef.current = targetValue; 

        // Cleanup animation on unmount or before next effect
        return () => controls.stop(); 
        
    }, [value, formatter]); // Rerun effect if value or formatter changes

    // Render initial value correctly formatted
    return <span ref={ref}>{formatter(value)}</span>;
};
