/**
 * Formats a numeric value in Indian Rupees (₹) using standard Indian numbering system (en-IN).
 * Example: 125000 -> "₹1,25,000.00"
 * Handles negative values cleanly: -125000 -> "-₹1,25,000.00"
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export function formatINR(amount) {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    if (num < 0) {
        return `-${inrFormatter.format(Math.abs(num))}`;
    }
    return inrFormatter.format(num);
}

/**
 * Formats Indian Rupees in compact notation for chart axis labels while keeping full INR in tooltips.
 */
export function formatCompactINR(amount) {
    const num = Number(amount) || 0;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 10000000) {
        return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
    }
    if (abs >= 100000) {
        return `${sign}₹${(abs / 100000).toFixed(2)}L`;
    }
    if (abs >= 1000) {
        return `${sign}₹${(abs / 1000).toFixed(1)}K`;
    }
    return `${sign}₹${abs.toFixed(0)}`;
}

export function formatDateTimeIN(dateVal) {
    if (!dateVal) return 'Just now';
    const d = new Date(dateVal);
    if (isNaN(d)) return 'Just now';
    return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export function formatDateIN(dateVal) {
    if (!dateVal) return 'Not set';
    const d = new Date(dateVal);
    if (isNaN(d)) return 'Not set';
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

