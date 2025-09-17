import { useState, useEffect } from 'react';

export default function Footer() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        // Check if the device is a touch device
        const checkMobile = () => {
            setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        
        // Add resize listener
        window.addEventListener('resize', checkMobile);
        
        // Initial check
        checkMobile();
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);
    
    const handleBotClick = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
    };
    
    const handleBotTouch = (e) => {
        // Prevent default touch behavior
        e.preventDefault();
        handleBotClick();
    };

    return(
        <div className="head">
            <img 
                src="/src/assets/footerImage-removebg-preview.ico" 
                alt="AI Bot" 
                className={`head-image ${isAnimating ? 'bot-animate' : ''}`}
                onClick={handleBotClick}
                onTouchStart={handleBotTouch}
                style={{
                    cursor: "pointer",
                    touchAction: "manipulation"
                }}
                title="Click me to interact!"
                aria-label="Interactive AI Bot"
                loading="lazy"
            />
        </div>
    );
}