# Mobile Features

## Overview

The Flutter mobile application provides the main workflows required for pharmacy management.

The implemented features are organized into separate modules to keep each business workflow independent and maintainable.

Current mobile features include:

- Authentication
- Dashboard
- Inventory
- Medicine Search and Filters
- Dispensing
- QR Code Scanner
- Missing Medicines
- Orders
- Onboarding
- Splash Screen

---

## Authentication

The authentication module is located at:

```text
lib/features/auth/
```

It provides:

- User login
- Owner registration
- Session management
- Logout

### Login Flow

```text
Login Screen
     │
     ▼
 AuthCubit
     │
     ▼
AuthRepository
     │
     ▼
 POST /api/users/login
     │
     ▼
 Save Token
     │
     ▼
 Dashboard
```

### Registration Flow

Registration is divided into two steps.

```text
Step 1
Name
Phone
Email
Password
   │
   ▼
Step 2
Pharmacy Name
   │
   ▼
Registration API
   │
   ▼
Authenticated Session
```

The current API does not provide an OTP or SMS verification endpoint, so registration proceeds directly to an authenticated session after successful registration.

---

## Dashboard

The dashboard provides the main entry point to the application.

It includes access to the main pharmacy operations and quick actions.

```text
lib/features/dashboard/
```

The dashboard uses `DashboardCubit` for state management.

---

## Inventory

The inventory module manages the pharmacy medicine list.

```text
lib/features/inventory/
```

Main screens include:

```text
MedicinesListScreen
FilterSearchScreen
```

The inventory module uses `InventoryCubit` to manage inventory-related state.

---

## Medicine Search and Filters

The application provides a dedicated search and filtering interface for medicines.

The filtering workflow is handled through the inventory feature and allows users to find medicines more efficiently.

```text
Medicine List
     │
     ▼
Search / Filter
     │
     ▼
Filtered Medicines
```

---

## Dispensing

The dispensing module handles the process of dispensing medicines.

```text
lib/features/dispense/
```

The workflow includes selecting the required quantity and displaying the successful dispensing result.

```text
Select Medicine
      │
      ▼
Select Quantity
      │
      ▼
Dispense
      │
      ▼
Success Screen
```

The feature uses `DispenseCubit` and `DispenseRepository`.

---

## QR Code Scanner

The scanner module provides QR code scanning functionality.

```text
lib/features/scanner/
```

The main screens are:

```text
QRScannerScreen
ScanResultScreen
```

The scanner uses `ScannerCubit` to manage the scanning state.

The general workflow is:

```text
Open Scanner
     │
     ▼
Scan QR Code
     │
     ▼
Scan Result
```

---

## Missing Medicines

The missing medicines module allows pharmacy users to record medicines that are unavailable.

```text
lib/features/missing_medicines/
```

Main screens include:

```text
MissingMedicinesScreen
AddShortageScreen
ShortageDetailsScreen
```

The feature also contains:

```text
MissingMedicineRepository
MissingMedicineModel
```

The workflow allows users to:

- View missing medicines
- Add a shortage
- View shortage details

---

## Orders

The orders module contains the order creation workflow.

```text
lib/features/orders/
```

The current implementation includes:

```text
CreateOrderScreen
```

This feature provides the interface for creating pharmacy orders.

---

## Onboarding

The onboarding module introduces the application to the user.

```text
lib/features/onboarding/
```

The main screen is:

```text
OnboardingScreen
```

It is part of the initial application experience before entering the main application.

---

## Splash Screen

The splash module provides the initial loading screen.

```text
lib/features/splash/
```

The main screen is:

```text
SplashScreen
```

It is used as part of the application startup flow before navigating to the appropriate application screen.

---

## Reusable UI Components

Common UI components are centralized inside:

```text
lib/core/widgets/
```

Current reusable components include:

```text
PrimaryButton
AppTextField
MedicineCard
StepProgress
```

These components reduce duplication and provide consistent UI behavior across different features.

---

## Shared Models

The application uses shared models for representing common data structures.

```text
UserModel
MedicineModel
MissingMedicineModel
```

These models can be reused by multiple features instead of defining duplicate data structures.

---

## Planned Authentication Features

The authentication interface currently contains placeholders for additional authentication methods.

These features are **not currently implemented**:

- Forgot Password
- Google Sign-In
- Apple Sign-In

The current UI displays these options as coming soon and they require backend/API support before becoming functional.

---

## Feature Architecture

Each major feature follows the same general structure:

```text
Feature
   │
   ├── Screens
   │
   ├── Cubit / BLoC
   │
   └── Repository
          │
          ▼
      ApiService
```

This structure keeps the UI, business logic, and data access separated.

---

## Feature Design Principles

The mobile features follow these principles:

- Independent feature modules
- Reusable UI components
- Centralized state management
- Repository-based data access
- Shared data models
- Consistent navigation and user flows
- Separation between UI and backend communication
