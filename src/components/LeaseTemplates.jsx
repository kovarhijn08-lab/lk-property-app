import React, { useState } from 'react';

const leaseTemplates = [
    {
        id: 'residential-standard',
        name: 'Standard Residential Lease',
        category: 'Residential',
        description: 'Basic residential lease agreement for long-term rentals',
        icon: '🏠',
        content: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into on [DATE] between:

LANDLORD: {{landlordName}}
TENANT: {{tenantName}}

PROPERTY: {{propertyAddress}}

LEASE TERMS:
- Lease Duration: {{leaseDuration}} months
- Monthly Rent: \${{monthlyRent}}
- Security Deposit: \${{securityDeposit}}
- Move-in Date: {{moveInDate}}

RESPONSIBILITIES:
- Landlord agrees to maintain the property in habitable condition
- Tenant agrees to pay rent on time and maintain the property
- Utilities: {{utilitiesResponsibility}}

SIGNATURES:
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______`
    },
    {
        id: 'commercial-space',
        name: 'Commercial Space Lease',
        category: 'Commercial',
        description: 'Commercial lease for offices, retail, or business spaces',
        icon: '🏢',
        content: `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement is entered into on [DATE] between:

LANDLORD: {{landlordName}}
TENANT (BUSINESS): {{businessName}}

PREMISES: {{propertyAddress}}
Purpose: {{businessPurpose}}

FINANCIAL TERMS:
- Base Rent: \${{monthlyRent}}/month
- CAM Charges: \${{camCharges}}/month
- Security Deposit: \${{securityDeposit}}
- Lease Term: {{leaseDuration}} months

ADDITIONAL TERMS:
- Operating Hours: {{operatingHours}}
- Signage Rights: {{signageRights}}
- Renewal Option: {{renewalOption}}

SIGNATURES:
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______`
    },
    {
        id: 'short-term-rental',
        name: 'Short-Term Rental Agreement',
        category: 'Short-Term',
        description: 'Agreement for Airbnb, vacation rentals, or short stays',
        icon: '🏨',
        content: `SHORT-TERM RENTAL AGREEMENT

Guest Name: {{tenantName}}
Property: {{propertyAddress}}

CHECK-IN/OUT:
- Check-in: {{checkInDate}} at {{checkInTime}}
- Check-out: {{checkOutDate}} at {{checkOutTime}}

PRICING:
- Nightly Rate: \${{nightlyRate}}
- Total Nights: {{totalNights}}
- Cleaning Fee: \${{cleaningFee}}
- Total Amount: \${{totalAmount}}

HOUSE RULES:
- Maximum Occupancy: {{maxOccupancy}} guests
- No Smoking: {{noSmoking}}
- Pets: {{petsAllowed}}
- Quiet Hours: {{quietHours}}

SIGNATURES:
Host: _________________ Date: _______
Guest: _________________ Date: _______`
    },
    {
        id: 'month-to-month',
        name: 'Month-to-Month Tenancy',
        category: 'Flexible',
        description: 'Flexible lease without fixed term',
        icon: '📅',
        content: `MONTH-TO-MONTH RENTAL AGREEMENT

This Agreement is entered into on [DATE] between:

LANDLORD: {{landlordName}}
TENANT: {{tenantName}}

PROPERTY: {{propertyAddress}}

TERMS:
- Monthly Rent: \${{monthlyRent}}
- Security Deposit: \${{securityDeposit}}
- Payment Due: {{paymentDueDate}} of each month
- Notice Period: {{noticePeriod}} days for termination

CONDITIONS:
- Either party may terminate with proper notice
- Rent may be adjusted with {{rentAdjustmentNotice}} days notice
- All other standard lease terms apply

SIGNATURES:
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______`
    }
];

const LeaseTemplates = ({ onSelectTemplate, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = leaseTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
       }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
           }}>
                {/* Header */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <div>
                        <h2 style={{margin: 0, fontSize: '1.5rem'}}>📄 Lease Templates</h2>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0'}}>
                            Choose a template to start your lease agreement
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer'}}
                    >
                        ×
                    </button>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="🔍 Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.95rem'
                   }}
                />

                {/* Templates Grid */}
                <div style={{flex: 1, overflowY: 'auto', marginBottom: '16px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px'}}>
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                style={{
                                    padding: '16px',
                                    background: selectedTemplate?.id === template.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                    border: selectedTemplate?.id === template.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                               }}
                            >
                                <div style={{fontSize: '2rem', marginBottom: '8px'}}>{template.icon}</div>
                                <div style={{fontWeight: 600, marginBottom: '4px'}}>{template.name}</div>
                                <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>
                                    {template.category}
                                </div>
                                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                    {template.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                {selectedTemplate && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                   }}>
                        <div style={{fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)'}}>
                            {selectedTemplate.content.substring(0, 300)}...
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{display: 'flex', gap: '12px'}}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid var(--glass-border)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                       }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUseTemplate}
                        disabled={!selectedTemplate}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: selectedTemplate ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                            opacity: selectedTemplate ? 1 : 0.5
                       }}
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaseTemplates;
