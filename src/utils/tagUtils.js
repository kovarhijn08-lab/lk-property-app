/**
 * Utility functions for Tags & Filters System (P3.3)
 */

/**
 * Generates a consistent HSL color based on a string hash.
 * @param {string} str - The tag name
 * @returns {string} - CSS HSL color string
 */
export const getTagColor = (str) => {
    if (!str) return 'hsl(0, 0%, 50%)';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    const s = 60 + Math.abs(hash % 30); // 60-90% saturation
    const l = 40 + Math.abs(hash % 20); // 40-60% lightness for readability

    return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Checks if an item matches the selected tags (AND logic)
 * @param {Object} item - Item with a 'tags' property (array of strings)
 * @param {Array} selectedTags - Array of strings to filter by
 */
export const matchTags = (item, selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) return true;
    if (!item.tags || !Array.isArray(item.tags)) return false;

    return selectedTags.every(tag =>
        item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
};

/**
 * Extracts unique tags from a list of properties or transactions
 * @param {Array} items 
 */
export const getUniqueTags = (items) => {
    const tags = new Set();
    items.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(t => tags.add(t));
        }
    });
    return Array.from(tags).sort();
};
