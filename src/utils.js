// src/utils.js

/**
 * Formats a number as Korean Won currency.
 * Includes fallback for invalid input.
 * @param {number | string | null | undefined} value - The value to format.
 * @param {string} [currencySymbol='₩'] - Currency symbol to use.
 * @param {number} [fractionDigits=0] - Number of digits after the decimal point.
 * @returns {string} Formatted currency string (e.g., "₩1,000,000").
 */
export const formatCurrency = (value, currencySymbol = '₩', fractionDigits = 0) => {
    const number = Number(value);
    // Return empty string or placeholder if value is not a valid number
    if (value === null || value === undefined || isNaN(number)) return `${currencySymbol}0`; // Or return '' depending on desired fallback

    return new Intl.NumberFormat('ko-KR', {
        // style: 'currency', // Style 'currency' forces the KRW symbol, we handle it manually
        // currency: 'KRW',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(number) + (currencySymbol === '₩' ? '원' : currencySymbol); // Append '원' if using default symbol
};

/**
 * Formats a number as a percentage string.
 * Includes fallback for invalid input.
 * @param {number | string | null | undefined} value - The value to format (e.g., 0.123 for 12.3%).
 * @param {number} [fractionDigits=1] - Number of digits after the decimal point.
 * @returns {string} Formatted percentage string (e.g., "12.3%").
 */
export const formatPercent = (value, fractionDigits = 1) => {
    const number = Number(value);
    // Return empty string or placeholder if value is not a valid number
    if (value === null || value === undefined || isNaN(number)) return `0.${'0'.repeat(fractionDigits)}%`; // Or return ''

    return new Intl.NumberFormat('ko-KR', {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(number);
};