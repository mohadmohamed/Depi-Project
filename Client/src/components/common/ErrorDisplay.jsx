import React from 'react';
import './ErrorDisplay.css';

const ErrorDisplay = ({ 
    error, 
    title = "Oops! Something went wrong", 
    showRefresh = true, 
    showRetry = true, 
    onRetry = null, 
    onRefresh = null,
    className = "",
    size = "normal" // "small", "normal", "large"
}) => {
    if (!error) return null;

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            window.location.reload();
        }
    };

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        }
    };

    const sizeClass = `error-display-${size}`;

    return (
        <div className={`error-display ${sizeClass} ${className}`}>
            <div className="error-icon">
                <svg 
                    width={size === 'small' ? '32' : size === 'large' ? '64' : '48'} 
                    height={size === 'small' ? '32' : size === 'large' ? '64' : '48'} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#dc2626" 
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            
            <h3 className="error-title">{title}</h3>
            <p className="error-message">{error}</p>
            
            {(showRefresh || showRetry) && (
                <div className="error-actions">
                    {showRefresh && (
                        <button 
                            className="retry-button"
                            onClick={handleRefresh}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            Refresh Page
                        </button>
                    )}
                    
                    {showRetry && onRetry && (
                        <button 
                            className="clear-error-button"
                            onClick={handleRetry}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                <path d="M3 21v-5h5"/>
                            </svg>
                            Try Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Inline Error Component (for smaller spaces)
export const InlineError = ({ error, onRetry = null, className = "" }) => {
    if (!error) return null;

    return (
        <div className={`inline-error ${className}`}>
            <div className="inline-error-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span className="inline-error-message">{error}</span>
                {onRetry && (
                    <button className="inline-retry-button" onClick={onRetry}>
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};

// Toast Error Component (for notifications)
export const ErrorToast = ({ error, onClose, duration = 5000 }) => {
    React.useEffect(() => {
        if (error && duration > 0) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [error, duration, onClose]);

    if (!error) return null;

    return (
        <div className="error-toast">
            <div className="error-toast-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span className="error-toast-message">{error}</span>
                {onClose && (
                    <button className="error-toast-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorDisplay;