/**
 * Email validation utility
 * Provides basic email format validation
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
    if (!email) {
        return {
            isValid: false,
            message: 'Email is required',
        };
    }

    // Basic format validation - just check for @ and domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            message: 'Please enter a valid email address',
        };
    }

    // Check for consecutive dots
    if (email.includes('..')) {
        return {
            isValid: false,
            message: 'Email cannot contain consecutive dots',
        };
    }

    // Check for dot before @
    if (email.split('@')[0].endsWith('.')) {
        return {
            isValid: false,
            message: 'Email cannot have a dot before @',
        };
    }

    return {
        isValid: true,
        message: 'Valid email address',
    };
};

/**
 * Quick email format check (for real-time validation)
 */
export const isEmailFormat = (email) => {
    const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return basicRegex.test(email);
};
