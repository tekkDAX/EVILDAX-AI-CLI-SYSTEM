

import { useState, useEffect } from 'preact/hooks';

export const useTypingEffect = (text, speed = 10) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset on new text
        if (text) {
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText(prev => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, speed);
            return () => clearInterval(timer);
        }
    }, [text, speed]);

    return displayedText;
};