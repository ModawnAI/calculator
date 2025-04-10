// src/utils.js

/**
 * Formats a number as Korean Won currency.
 * @param {number | string | null | undefined} value - The value to format.
 * @param {string} [fallback='₩0'] - The fallback string if value is invalid.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (value, fallback = '₩0') => {
    if (value === null || value === undefined || isNaN(Number(value))) return fallback;
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(value));
};

/**
 * Formats a number as a percentage with one decimal place.
 * @param {number | string | null | undefined} value - The value to format (e.g., 0.123 for 12.3%).
 * @param {string} [fallback='0.0%'] - The fallback string if value is invalid.
 * @returns {string} Formatted percentage string.
 */
export const formatPercent = (value, fallback = '0.0%') => {
    if (value === null || value === undefined || isNaN(Number(value))) return fallback;
    return new Intl.NumberFormat('ko-KR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number(value));
};