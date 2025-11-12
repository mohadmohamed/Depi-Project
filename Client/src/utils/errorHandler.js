/**
 * Global Error Handler Utility
 * Provides user-friendly error messages for the entire application
 */

export const getUserFriendlyError = (error, context = '') => {
    // Handle null/undefined errors
    if (!error) {
        return "An unexpected error occurred. Please try again.";
    }
    
    // Convert error to string if it's an object
    const errorMessage = typeof error === 'string' ? error : error.message || error.toString();
    
    // Network related errors
    if (error.name === 'NetworkError' || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Network request failed')) {
        return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    
    // Authentication errors
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Authentication failed') ||
        errorMessage.includes('Invalid token')) {
        return "Your session has expired. Please log in again to continue.";
    }
    
    // Forbidden errors
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        return "You don't have permission to perform this action.";
    }
    
    // Server errors
    if (errorMessage.includes('500') || 
        errorMessage.includes('Internal Server Error') ||
        errorMessage.includes('Server Error')) {
        return "We're experiencing technical difficulties. Please try again in a few moments.";
    }
    
    // Not found errors
    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        return "The requested information could not be found. It may have been removed or moved.";
    }
    
    // Bad request errors
    if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        return "There was an issue with your request. Please check your input and try again.";
    }
    
    // Parsing errors
    if (error.name === 'SyntaxError' || 
        errorMessage.includes('JSON') ||
        errorMessage.includes('Unexpected token') ||
        errorMessage.includes('parsing')) {
        return "There was an issue processing the data. Please refresh the page and try again.";
    }
    
    // Timeout errors
    if (error.name === 'AbortError' || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('Request timeout')) {
        return "The request took too long to complete. Please try again.";
    }
    
    // File upload errors
    if (errorMessage.includes('file') && errorMessage.includes('size')) {
        return "The file you're trying to upload is too large. Please choose a smaller file.";
    }
    
    if (errorMessage.includes('file') && errorMessage.includes('type')) {
        return "The file type is not supported. Please choose a different file.";
    }
    
    // Context-specific fallbacks
    switch (context.toLowerCase()) {
        case 'login':
        case 'authentication':
            return "Unable to log in. Please check your credentials and try again.";
        
        case 'register':
        case 'signup':
            return "Unable to create your account. Please try again or contact support.";
        
        case 'upload':
        case 'file-upload':
            return "Unable to upload the file. Please check the file and try again.";
        
        case 'resume':
        case 'resume-analysis':
            return "Unable to analyze your resume. Please try again or upload a different file.";
        
        case 'interview':
        case 'questions':
            return "Unable to load the interview questions. Please refresh the page and try again.";
        
        case 'sessions':
        case 'interview-sessions':
            return "Unable to load your interview sessions. Please refresh the page and try again.";
        
        case 'session-details':
            return "Unable to load the interview details. Please try selecting a different session.";
        
        case 'profile':
        case 'user-profile':
            return "Unable to load your profile information. Please refresh the page and try again.";
        
        case 'data-parsing':
        case 'parsing':
            return "There was an issue displaying the information. The data may be corrupted.";
        
        case 'save':
        case 'saving':
            return "Unable to save your changes. Please try again.";
        
        case 'delete':
        case 'deletion':
            return "Unable to delete the item. Please try again.";
        
        case 'update':
        case 'updating':
            return "Unable to update the information. Please try again.";
        
        default:
            return "Something went wrong. Please refresh the page and try again.";
    }
};

/**
 * Logs the technical error for developers while showing user-friendly message
 */
export const handleError = (error, context = '', showAlert = false) => {
    // Log technical details for developers
    console.error(`Error in ${context}:`, error);
    
    // Get user-friendly message
    const userMessage = getUserFriendlyError(error, context);
    
    // Optionally show alert
    if (showAlert) {
        alert(userMessage);
    }
    
    return userMessage;
};

/**
 * Creates a standardized error response for API calls
 */
export const createErrorResponse = (error, context = '') => {
    return {
        success: false,
        error: true,
        message: getUserFriendlyError(error, context),
        technicalError: error.message || error.toString(),
        context: context
    };
};

/**
 * Promise wrapper that automatically handles errors with user-friendly messages
 */
export const safeApiCall = async (apiCall, context = '') => {
    try {
        const result = await apiCall();
        return {
            success: true,
            data: result,
            error: false
        };
    } catch (error) {
        console.error(`API Error in ${context}:`, error);
        return createErrorResponse(error, context);
    }
};

/**
 * React hook for error handling
 */
export const useErrorHandler = () => {
    const handleError = (error, context = '', callback = null) => {
        const message = getUserFriendlyError(error, context);
        console.error(`Error in ${context}:`, error);
        
        if (callback && typeof callback === 'function') {
            callback(message);
        }
        
        return message;
    };
    
    return { handleError };
};

export default {
    getUserFriendlyError,
    handleError,
    createErrorResponse,
    safeApiCall,
    useErrorHandler
};