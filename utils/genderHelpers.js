// utils/genderHelpers.js

/**
 * Normalize gender category to standard format
 * @param {string} category - The category from database
 * @returns {string} - Normalized gender ('men', 'women', or original)
 */
export const normalizeGender = (category) => {
    if (!category) return '';
    const lower = category.toLowerCase().trim();
    
    // Men variations
    if (lower === 'men' || lower === 'mens' || lower === "men's" || lower === "mens'") {
        return 'men';
    }
    
    // Women variations
    if (lower === 'women' || lower === 'womens' || lower === "women's" || lower === "womens'") {
        return 'women';
    }
    
    // Unisex
    if (lower === 'unisex' || lower === 'unisex') {
        return 'unisex';
    }
    
    return lower;
};

/**
 * Check if category belongs to Men
 * @param {string} category 
 * @returns {boolean}
 */
export const isMenCategory = (category) => {
    return normalizeGender(category) === 'men';
};

/**
 * Check if category belongs to Women
 * @param {string} category 
 * @returns {boolean}
 */
export const isWomenCategory = (category) => {
    return normalizeGender(category) === 'women';
};

/**
 * Get gender display name from category
 * @param {string} category 
 * @returns {string}
 */
export const getGenderDisplayName = (category) => {
    const normalized = normalizeGender(category);
    if (normalized === 'men') return 'Men';
    if (normalized === 'women') return 'Women';
    return category;
};