import { useState } from 'react';
import Bot from "../../assets/Bot.jpg";

export default function Footer() {
    const [isAnimating, setIsAnimating] = useState(false);
    
    const handleBotClick = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
        // You could add additional functionality here like opening a chatbot
    };

    return(
        <div className="head">
            <img 
                src="/src/assets/footerImage-removebg-preview.ico" 
                alt="AI Bot" 
                className={`head-image ${isAnimating ? 'bot-animate' : ''}`}
                onClick={handleBotClick}
                style={{cursor: "pointer"}}
                title="Click me to interact!"
            />
        </div>
    );
}