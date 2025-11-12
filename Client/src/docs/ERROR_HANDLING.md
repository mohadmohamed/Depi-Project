# Global Error Handling System

This document explains how to use the global error handling system throughout the application.

## 📁 File Structure

```
src/
├── utils/
│   └── errorHandler.js           # Core error handling utilities
├── components/
│   └── common/
│       ├── ErrorDisplay.jsx      # UI components for displaying errors
│       └── ErrorDisplay.css      # Styles for error components
└── hooks/
    └── useErrorHandler.js         # React hooks for error handling
```

## 🛠️ Core Components

### 1. Error Handler Utility (`utils/errorHandler.js`)

#### `getUserFriendlyError(error, context)`
Converts technical errors into user-friendly messages.

```javascript
import { getUserFriendlyError } from '../utils/errorHandler';

const userMessage = getUserFriendlyError(error, 'login');
// Returns: "Unable to log in. Please check your credentials and try again."
```

#### `handleError(error, context, showAlert)`
Logs technical error and returns user-friendly message.

```javascript
import { handleError } from '../utils/errorHandler';

try {
    await api.login(credentials);
} catch (error) {
    const message = handleError(error, 'login', true); // Shows alert
}
```

#### `safeApiCall(apiCall, context)`
Wraps API calls with automatic error handling.

```javascript
import { safeApiCall } from '../utils/errorHandler';

const result = await safeApiCall(
    () => fetch('/api/data').then(res => res.json()),
    'data-loading'
);

if (result.success) {
    console.log(result.data);
} else {
    console.log(result.message); // User-friendly error message
}
```

### 2. Error Display Components (`components/common/ErrorDisplay.jsx`)

#### `ErrorDisplay` - Full error display with actions
```jsx
import ErrorDisplay from '../components/common/ErrorDisplay';

<ErrorDisplay 
    error="Unable to load data"
    title="Something went wrong"
    onRetry={() => refetchData()}
    onRefresh={() => window.location.reload()}
    showRefresh={true}
    showRetry={true}
    size="normal" // "small", "normal", "large"
/>
```

#### `InlineError` - Compact error display
```jsx
import { InlineError } from '../components/common/ErrorDisplay';

<InlineError 
    error="Invalid email format"
    onRetry={() => validateEmail()}
/>
```

#### `ErrorToast` - Notification-style error
```jsx
import { ErrorToast } from '../components/common/ErrorDisplay';

<ErrorToast 
    error="Failed to save changes"
    onClose={() => setError(null)}
    duration={5000}
/>
```

### 3. Error Handling Hooks (`hooks/useErrorHandler.js`)

#### `useGlobalErrorHandler()`
Comprehensive error handling for components.

```jsx
import { useGlobalErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
    const { error, handleError, clearError, safeApiCall } = useGlobalErrorHandler();
    
    const loadData = async () => {
        const result = await safeApiCall(
            () => fetch('/api/data').then(res => res.json()),
            'data-loading'
        );
        
        if (result.success) {
            setData(result.data);
        }
        // Error is automatically handled and stored in 'error' state
    };
    
    return (
        <div>
            {error && <ErrorDisplay error={error} onRetry={clearError} />}
            {/* Your component content */}
        </div>
    );
}
```

#### `useFormErrorHandler()`
Specialized for form validation errors.

```jsx
import { useFormErrorHandler } from '../hooks/useErrorHandler';

function LoginForm() {
    const { errors, setFieldError, clearFieldError, clearAllErrors } = useFormErrorHandler();
    
    const handleSubmit = (formData) => {
        clearAllErrors();
        
        if (!formData.email) {
            setFieldError('email', 'Email is required', 'validation');
        }
        
        // Submit form...
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="email" 
                onChange={() => clearFieldError('email')}
            />
            {errors.email && <InlineError error={errors.email} />}
        </form>
    );
}
```

#### `useAsyncOperation()`
Manages loading states with error handling.

```jsx
import { useAsyncOperation } from '../hooks/useErrorHandler';

function DataComponent() {
    const { loading, error, data, execute } = useAsyncOperation();
    
    const loadData = () => {
        execute(
            () => fetch('/api/data').then(res => res.json()),
            'data-loading'
        );
    };
    
    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <ErrorDisplay error={error} onRetry={loadData} />}
            {data && <div>{/* Display data */}</div>}
        </div>
    );
}
```

## 🎯 Error Contexts

The system recognizes different contexts and provides appropriate messages:

| Context | Example Message |
|---------|----------------|
| `login` | "Unable to log in. Please check your credentials and try again." |
| `upload` | "Unable to upload the file. Please check the file and try again." |
| `resume-analysis` | "Unable to analyze your resume. Please try again or upload a different file." |
| `interview` | "Unable to load the interview questions. Please refresh the page and try again." |
| `sessions` | "Unable to load your interview sessions. Please refresh the page and try again." |
| `profile` | "Unable to load your profile information. Please refresh the page and try again." |

## 📱 Usage Examples

### Basic Error Handling in Components

```jsx
import React, { useState } from 'react';
import { handleError } from '../utils/errorHandler';
import ErrorDisplay from '../components/common/ErrorDisplay';

function MyComponent() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            // Handle success...
        } catch (err) {
            const userMessage = handleError(err, 'data-loading');
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            {error && (
                <ErrorDisplay 
                    error={error} 
                    onRetry={() => setError(null)} 
                />
            )}
            {/* Rest of component */}
        </div>
    );
}
```

### Using Hooks for Cleaner Code

```jsx
import React from 'react';
import { useGlobalErrorHandler } from '../hooks/useErrorHandler';

function CleanerComponent() {
    const { error, safeApiCall } = useGlobalErrorHandler();
    
    const fetchData = () => {
        safeApiCall(
            () => fetch('/api/data').then(res => res.json()),
            'data-loading'
        ).then(result => {
            if (result.success) {
                // Handle success
            }
        });
    };
    
    return (
        <div>
            {error && <ErrorDisplay error={error} />}
            <button onClick={fetchData}>Load Data</button>
        </div>
    );
}
```

## 🎨 Styling

The error components automatically match your site's theme:
- Uses Poppins font family
- Gradient buttons matching site colors
- Responsive design for all screen sizes
- Consistent with existing UI patterns

## 🔧 Customization

You can extend the error handler by adding new contexts or modifying messages in `utils/errorHandler.js`:

```javascript
// Add new context in getUserFriendlyError function
case 'custom-feature':
    return "Custom error message for your feature.";
```

## 📋 Migration Guide

To migrate existing error handling:

1. **Replace manual error messages:**
   ```jsx
   // Before
   .catch(error => {
       alert("Something went wrong");
   });
   
   // After
   .catch(error => {
       const message = handleError(error, 'appropriate-context');
       alert(message);
   });
   ```

2. **Replace custom error displays:**
   ```jsx
   // Before
   {error && <div className="error">{error}</div>}
   
   // After
   {error && <ErrorDisplay error={error} />}
   ```

3. **Use hooks for new components:**
   ```jsx
   // New components should use
   const { error, handleError } = useGlobalErrorHandler();
   ```

This system ensures consistent, user-friendly error handling across your entire application! 🎉