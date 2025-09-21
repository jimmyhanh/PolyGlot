/**
 * @fileoverview Performance utilities and optimizations
 * @author PolyGlot Team
 */

/**
 * Performance utility class with common optimization methods
 * @class PerformanceUtils
 */
export class PerformanceUtils {
    /**
     * Creates a debounced version of a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} Debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Creates a throttled version of a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Lazy loads an image with loading placeholder
     * @param {HTMLImageElement} img - Image element to lazy load
     * @param {string} src - Image source URL
     * @param {string} placeholder - Placeholder image URL
     */
    static lazyLoadImage(img, src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4K') {
        img.src = placeholder;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    img.src = src;
                    img.onload = () => img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        observer.observe(img);
    }

    /**
     * Optimizes animation frames for smooth animations
     * @param {Function} callback - Animation callback
     * @returns {number} Animation frame ID
     */
    static requestOptimizedAnimationFrame(callback) {
        return requestAnimationFrame(() => {
            requestAnimationFrame(callback);
        });
    }

    /**
     * Measures and logs performance metrics
     * @param {string} name - Performance mark name
     * @param {Function} fn - Function to measure
     * @returns {Promise<any>} Function result
     */
    static async measurePerformance(name, fn) {
        const startMark = `${name}-start`;
        const endMark = `${name}-end`;
        
        performance.mark(startMark);
        const result = await fn();
        performance.mark(endMark);
        
        performance.measure(name, startMark, endMark);
        
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name} took ${measure.duration.toFixed(2)}ms`);
        
        return result;
    }

    /**
     * Cleans up performance marks and measures
     * @param {string} name - Mark/measure name to clean up
     */
    static cleanupPerformanceMarks(name) {
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
    }

    /**
     * Checks if user prefers reduced motion
     * @returns {boolean} True if reduced motion is preferred
     */
    static prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Gets optimal image format based on browser support
     * @returns {string} Optimal image format
     */
    static getOptimalImageFormat() {
        if (this.supportsWebP()) return 'webp';
        if (this.supportsAvif()) return 'avif';
        return 'jpg';
    }

    /**
     * Checks WebP support
     * @returns {boolean} True if WebP is supported
     */
    static supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    }

    /**
     * Checks AVIF support
     * @returns {boolean} True if AVIF is supported
     */
    static supportsAvif() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/avif').startsWith('data:image/avif');
    }

    /**
     * Preloads critical resources
     * @param {string[]} urls - URLs to preload
     * @param {string} as - Resource type (script, style, image, etc.)
     */
    static preloadResources(urls, as = 'fetch') {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = as;
            document.head.appendChild(link);
        });
    }

    /**
     * Memory efficient event listener management
     * @param {EventTarget} target - Event target
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {Function} Cleanup function
     */
    static addManagedEventListener(target, event, handler, options = {}) {
        target.addEventListener(event, handler, options);
        return () => target.removeEventListener(event, handler, options);
    }
}