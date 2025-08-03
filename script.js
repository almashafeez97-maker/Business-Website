/**
 * Business Website JavaScript
 * 
 * This file contains all the interactive functionality for the business website
 * including navigation, form validation, animations, and smooth scrolling.
 * 
 * Features:
 * - Mobile navigation toggle
 * - Smooth scrolling between sections
 * - Form validation and submission
 * - Scroll animations
 * - Active navigation highlighting
 */

// ===================================
// GLOBAL VARIABLES AND UTILITIES
// ===================================

/**
 * DOM element selectors - cached for better performance
 */
const DOM = {
    hamburger: document.getElementById('hamburger'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    contactForm: document.getElementById('contact-form'),
    header: document.getElementById('header'),
    sections: document.querySelectorAll('section[id]'),
    animatedElements: document.querySelectorAll('.service-card, .stat-item, .about-text, .contact-info')
};

/**
 * Configuration object for various settings
 */
const CONFIG = {
    scrollOffset: 80, // Offset for fixed header when scrolling to sections
    animationDelay: 100, // Delay between scroll animations
    formSubmissionDelay: 2000 // Simulated form submission delay
};

/**
 * Application state
 */
const STATE = {
    isMenuOpen: false,
    isFormSubmitting: false,
    currentSection: 'home'
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if an element is in the viewport
 * @param {Element} element - DOM element to check
 * @returns {boolean} True if element is visible
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to a target element
 * @param {string} targetId - ID of the target element
 */
function smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop - CONFIG.scrollOffset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// ===================================
// NAVIGATION FUNCTIONALITY
// ===================================

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    STATE.isMenuOpen = !STATE.isMenuOpen;
    
    // Toggle classes for animation
    DOM.hamburger.classList.toggle('active');
    DOM.navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
    
    // Update ARIA attributes for accessibility
    DOM.hamburger.setAttribute('aria-expanded', STATE.isMenuOpen);
    DOM.navMenu.setAttribute('aria-hidden', !STATE.isMenuOpen);
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (STATE.isMenuOpen) {
        toggleMobileMenu();
    }
}

/**
 * Handle navigation link clicks
 * @param {Event} event - Click event
 */
function handleNavLinkClick(event) {
    event.preventDefault();
    
    const targetId = event.target.getAttribute('href').substring(1);
    
    // Close mobile menu if open
    closeMobileMenu();
    
    // Smooth scroll to target section
    smoothScrollTo(targetId);
    
    // Update active nav link
    updateActiveNavLink(targetId);
}

/**
 * Update active navigation link based on current section
 * @param {string} sectionId - ID of the current section
 */
function updateActiveNavLink(sectionId) {
    DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    STATE.currentSection = sectionId;
}

/**
 * Handle scroll events to update active navigation
 */
function handleScroll() {
    let currentSection = 'home';
    
    // Find the current section based on scroll position
    DOM.sections.forEach(section => {
        const sectionTop = section.offsetTop - CONFIG.scrollOffset - 50;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Update active nav link if section changed
    if (currentSection !== STATE.currentSection) {
        updateActiveNavLink(currentSection);
    }
    
    // Handle header background on scroll
    if (window.scrollY > 50) {
        DOM.header.classList.add('scrolled');
    } else {
        DOM.header.classList.remove('scrolled');
    }
}

// ===================================
// FORM VALIDATION AND SUBMISSION
// ===================================

/**
 * Form validation rules
 */
const VALIDATION_RULES = {
    name: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'Please enter a valid name (letters and spaces only)'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        required: false,
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
    },
    subject: {
        required: true,
        minLength: 5,
        message: 'Subject must be at least 5 characters long'
    },
    message: {
        required: true,
        minLength: 10,
        message: 'Message must be at least 10 characters long'
    }
};

/**
 * Validate a single form field
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateField(fieldName, value) {
    const rules = VALIDATION_RULES[fieldName];
    if (!rules) return { isValid: true, message: '' };
    
    // Check if required field is empty
    if (rules.required && (!value || value.trim() === '')) {
        return { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
    }
    
    // Skip validation for optional empty fields
    if (!rules.required && (!value || value.trim() === '')) {
        return { isValid: true, message: '' };
    }
    
    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
        return { isValid: false, message: rules.message };
    }
    
    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
        return { isValid: false, message: rules.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Display validation error for a field
 * @param {string} fieldName - Name of the field
 * @param {string} message - Error message to display
 */
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

/**
 * Clear validation error for a field
 * @param {string} fieldName - Name of the field
 */
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

/**
 * Validate the entire contact form
 * @returns {boolean} True if form is valid
 */
function validateForm() {
    let isFormValid = true;
    const formData = new FormData(DOM.contactForm);
    
    // Validate each field
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
        const fieldValue = formData.get(fieldName) || '';
        const validation = validateField(fieldName, fieldValue);
        
        if (validation.isValid) {
            clearFieldError(fieldName);
        } else {
            showFieldError(fieldName, validation.message);
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

/**
 * Handle real-time field validation
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    
    // Only validate if field has been interacted with
    if (event.target.classList.contains('touched')) {
        const validation = validateField(fieldName, fieldValue);
        
        if (validation.isValid) {
            clearFieldError(fieldName);
        } else {
            showFieldError(fieldName, validation.message);
        }
    }
}

/**
 * Mark field as touched when user interacts with it
 * @param {Event} event - Focus event
 */
function handleFieldFocus(event) {
    event.target.classList.add('touched');
}

/**
 * Simulate form submission (replace with actual API call in production)
 * @param {FormData} formData - Form data to submit
 * @returns {Promise} Promise that resolves with submission result
 */
async function submitFormData(formData) {
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real application, you would send the data to your server
            console.log('Form submitted with data:', Object.fromEntries(formData));
            resolve({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
        }, CONFIG.formSubmissionDelay);
    });
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (STATE.isFormSubmitting) return;
    
    // Validate form
    if (!validateForm()) {
        // Focus on first error field
        const firstError = DOM.contactForm.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Update UI for submission state
    STATE.isFormSubmitting = true;
    const submitBtn = DOM.contactForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
        // Submit form data
        const formData = new FormData(DOM.contactForm);
        const result = await submitFormData(formData);
        
        if (result.success) {
            // Show success message
            showFormMessage(result.message, 'success');
            
            // Reset form
            DOM.contactForm.reset();
            
            // Clear any remaining errors
            Object.keys(VALIDATION_RULES).forEach(fieldName => {
                clearFieldError(fieldName);
                const inputElement = document.getElementById(fieldName);
                if (inputElement) {
                    inputElement.classList.remove('touched');
                }
            });
        } else {
            showFormMessage('There was an error sending your message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage('There was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset submission state
        STATE.isFormSubmitting = false;
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

/**
 * Show form submission message
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = DOM.contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        font-weight: 500;
        background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    
    // Insert message at the top of the form
    DOM.contactForm.insertBefore(messageElement, DOM.contactForm.firstChild);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

/**
 * Initialize scroll animations for elements
 */
function initScrollAnimations() {
    // Add fade-in class to animated elements
    DOM.animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Check for visible elements on load
    checkScrollAnimations();
}

/**
 * Check which elements should be animated based on scroll position
 */
function checkScrollAnimations() {
    DOM.animatedElements.forEach((element, index) => {
        if (isInViewport(element)) {
            // Add delay for staggered animation
            setTimeout(() => {
                element.classList.add('visible');
            }, index * CONFIG.animationDelay);
        }
    });
}

// ===================================
// EVENT LISTENERS
// ===================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Mobile menu toggle
    if (DOM.hamburger) {
        DOM.hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (STATE.isMenuOpen && 
            !DOM.navMenu.contains(event.target) && 
            !DOM.hamburger.contains(event.target)) {
            closeMobileMenu();
        }
    });
    
    // Scroll events (debounced for performance)
    window.addEventListener('scroll', debounce(() => {
        handleScroll();
        checkScrollAnimations();
    }, 10));
    
    // Form event listeners
    if (DOM.contactForm) {
        DOM.contactForm.addEventListener('submit', handleFormSubmit);
        
        // Add input validation listeners
        const formFields = DOM.contactForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('input', handleFieldInput);
            field.addEventListener('focus', handleFieldFocus);
        });
    }
    
    // Window resize events
    window.addEventListener('resize', debounce(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && STATE.isMenuOpen) {
            closeMobileMenu();
        }
    }, 250));
    
    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
        // Close mobile menu with Escape key
        if (event.key === 'Escape' && STATE.isMenuOpen) {
            closeMobileMenu();
        }
    });
}

// ===================================
// INITIALIZATION
// ===================================

/**
 * Initialize the application when DOM is loaded
 */
function init() {
    console.log('Business Website initialized');
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Set initial active nav link
    updateActiveNavLink('home');
    
    // Initial scroll check
    handleScroll();
    
    // Add loaded class to body for CSS animations
    document.body.classList.add('loaded');
}

// ===================================
// APPLICATION START
// ===================================

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded
    init();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && STATE.isMenuOpen) {
        closeMobileMenu();
    }
});

// Export functions for potential testing or external use
window.BusinessWebsite = {
    toggleMobileMenu,
    smoothScrollTo,
    validateForm,
    init
};
