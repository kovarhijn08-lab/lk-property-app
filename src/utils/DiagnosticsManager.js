import { validateForm } from './validators';

/**
 * DiagnosticsManager
 * Centralized tool for checking data integrity and providing fixes.
 */

export const runGlobalDiagnostics = (properties = []) => {
    const results = {
        totalChecks: 0,
        errorsFound: 0,
        criticalIssues: [],
        recommendations: [],
        stats: {
            missingAddresses: 0,
            invalidValues: 0,
            emptyNames: 0
        }
    };

    if (!Array.isArray(properties)) {
        console.error('Diagnostics Error: Input is not an array', properties);
        return results;
    }

    properties.forEach(prop => {
        results.totalChecks++;

        // Use the same validation engine as forms
        const errors = validateForm('property', {
            ...prop,
            marketValue: prop.marketValue || prop.purchasePrice
        });

        if (Object.keys(errors).length > 0) {
            results.errorsFound += Object.keys(errors).length;

            const issue = {
                propertyId: prop.id,
                propertyName: prop.name || 'Unknown Property',
                errors: Object.entries(errors).map(([field, err]) => ({
                    field,
                    message: err.message,
                    example: err.example
                }))
            };

            results.criticalIssues.push(issue);

            // Update stats
            if (errors.address) results.stats.missingAddresses++;
            if (errors.marketValue) results.stats.invalidValues++;
            if (errors.name) results.stats.emptyNames++;
        }
    });

    // Generate recommendations
    if (results.errorsFound > 0) {
        if (results.stats.missingAddresses > 0) {
            results.recommendations.push({
                type: 'warning',
                text: `Missing addresses found in ${results.stats.missingAddresses} properties. This affects map and analytics functionality.`
            });
        }
        if (results.stats.invalidValues > 0) {
            results.recommendations.push({
                type: 'critical',
                text: `${results.stats.invalidValues} properties have zero or invalid market values. Financial metrics might be incorrect.`
            });
        }
    } else {
        results.recommendations.push({
            type: 'success',
            text: 'All properties passed integrity checks. Data is healthy!'
        });
    }

    return results;
};

export const autoFixProperty = (prop) => {
    const fixed = { ...prop };
    let changesCount = 0;

    if (!fixed.name || fixed.name.trim().length < 3) {
        fixed.name = fixed.name || 'New Property';
        changesCount++;
    }

    if (!fixed.address || fixed.address.trim().length < 5) {
        fixed.address = 'Address pending...';
        changesCount++;
    }

    if (isNaN(fixed.marketValue) || Number(fixed.marketValue) <= 0) {
        fixed.marketValue = fixed.purchasePrice || 1;
        changesCount++;
    }

    return { fixed, changesCount };
};

export const runUserDiagnostics = (users = []) => {
    const results = {
        totalChecks: 0,
        errorsFound: 0,
        criticalIssues: [],
        stats: {
            missingNames: 0,
            invalidEmails: 0
        }
    };

    users.forEach(user => {
        results.totalChecks++;
        const errors = [];

        if (!user.name || user.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'User name too short or missing' });
            results.stats.missingNames++;
        }

        if (!user.email || !user.email.includes('@')) {
            errors.push({ field: 'email', message: 'Invalid email address' });
            results.stats.invalidEmails++;
        }

        if (errors.length > 0) {
            results.errorsFound += errors.length;
            results.criticalIssues.push({
                userId: user.id,
                userName: user.name || 'Anonymous',
                userEmail: user.email || 'N/A',
                errors
            });
        }
    });

    return results;
};

