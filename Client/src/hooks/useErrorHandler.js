import { useState, useCallback } from 'react';
import { getUserFriendlyError, handleError as globalHandleError } from '../utils/errorHandler';

/**
 * Custom React hook for handling errors throughout the application
 * Provides consistent error handling and user-friendly messages
 */
export const useGlobalErrorHandler = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Handle error with user-friendly message
    const handleError = useCallback((error, context = '', showAlert = false) => {
        const userMessage = globalHandleError(error, context, showAlert);
        setError(userMessage);
        return userMessage;
    }, []);

    // Safe API call wrapper
    const safeApiCall = useCallback(async (apiCall, context = '', showAlert = false) => {
        setIsLoading(true);
        clearError();
        
        try {
            const result = await apiCall();
            setIsLoading(false);
            return {
                success: true,
                data: result,
                error: false
            };
        } catch (err) {
            setIsLoading(false);
            const userMessage = handleError(err, context, showAlert);
            return {
                success: false,
                data: null,
                error: true,
                message: userMessage
            };
        }
    }, [handleError, clearError]);

    // Get user-friendly error message without setting state
    const getErrorMessage = useCallback((error, context = '') => {
        return getUserFriendlyError(error, context);
    }, []);

    return {
        error,
        isLoading,
        clearError,
        handleError,
        safeApiCall,
        getErrorMessage,
        setError,
        setIsLoading
    };
};

/**
 * Hook for form-specific error handling
 */
export const useFormErrorHandler = () => {
    const [errors, setErrors] = useState({});
    
    const setFieldError = useCallback((field, error, context = '') => {
        const userMessage = getUserFriendlyError(error, context);
        setErrors(prev => ({
            ...prev,
            [field]: userMessage
        }));
    }, []);

    const clearFieldError = useCallback((field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);

    const hasErrors = Object.keys(errors).length > 0;

    return {
        errors,
        setFieldError,
        clearFieldError,
        clearAllErrors,
        hasErrors
    };
};

/**
 * Hook for managing loading states with error handling
 */
export const useAsyncOperation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async (asyncFunction, context = '') => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await asyncFunction();
            setData(result);
            setLoading(false);
            return result;
        } catch (err) {
            const userMessage = getUserFriendlyError(err, context);
            setError(userMessage);
            setLoading(false);
            console.error(`Error in ${context}:`, err);
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        loading,
        error,
        data,
        execute,
        reset
    };
};

export default useGlobalErrorHandler;