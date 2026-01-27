# Design Specification: Mobile Companion App (PWA)

## Overview
The Mobile Companion App for **Smart Pocket Ledger** is designed as a "field tool" for property owners. It doesn't replicate the full desktop experience but focuses on high-frequency, on-the-go tasks: maintenance, task management, rapid data entry, and vital property info.

## Architecture
- **Tech Stack**: Progressive Web App (PWA) built with React.
- **Routing**: Adaptive routing detects device type and switches between Desktop (Sidebar) and Mobile (Bottom Nav) layouts.
- **Offline Mode**: Service Workers cache "Agenda", "Door Codes", and "Contacts" for access in low-connectivity areas (elevators, basements).

## Navigation & UI
A **5-item Bottom Navigation Bar** with glassmorphism aesthetics:
1. **Home (Tasks)**: Vertical feed of Smart Tasks (Swipe to complete/snooze).
2. **Agenda**: Vertical timeline of check-ins/check-outs and cleanings.
3. **Action Button (+)**: Central prominent button for:
   - AI Receipt Scan (starts camera).
   - Add Transaction (manual).
   - New Service Ticket (Photo + Description).
4. **Chats**: Direct messaging with tenants, linked to specific leases/properties.
5. **Portfolio**: Quick access to property cards (Door codes, service contacts, essential docs).

## Core Features

### 1. Service Tickets (New)
- **Flow**: User captures a photo of a maintenance issue -> AI suggests a category -> User adds manual description/details -> Ticket is saved and can be shared with a pre-saved service contact.
- **Industry Practice**: High-speed reporting to prevent secondary damage (e.g., leaks).

### 2. Smart Tasks (Mobile Feed)
- **UX**: Instead of a panel, it's the main feed. Interactive cards for lease expirations and rent collection.
- **System Integration**: Integrated with `SignatureCanvas.jsx` for mobile contract signing.

### 3. AI Receipt Scanner (Enhanced)
- **UX**: Direct camera access. 
- **Validation**: User confirms or manually overrides the AI-detected category/amount before saving.

### 4. Advanced Metrics (Multi-Asset)
- **Navigation**: Horizontal "Carousel" at the top to switch between "Global Portfolio" and specific properties.
- **Construction View**: Special "Capitalization" view comparing total investments vs. market value (Equity Gain).

### 5. Legal Hub (Lite)
- **Search-First**: Dynamic filters ("Awaiting Signature", "Active", "Archive").
- **Quick Look**: Native PDF preview with mobile sharing (Share Sheet).

## Phase 1 Implementation Priorities
1. **PWA Shell & Mobile Navigation**.
2. **Agenda & Smart Tasks Feed**.
3. **Receipt Scanner (Camera Integration)**.
4. **Portfolio Cards (Door Codes & Service Contacts)**.

Ready to proceed with execution?
