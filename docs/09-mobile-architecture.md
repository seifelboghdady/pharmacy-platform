# Mobile Architecture

## Overview

The mobile application is built using **Flutter** and follows a feature-based layered architecture.

The architecture is responsible for:

- Separating UI from business logic
- Organizing features independently
- Centralizing API communication
- Managing application state
- Reusing shared models and components
- Keeping the application modular and maintainable

The main application source code is located inside:

```text
/mobile/lib
```

---

## Architecture Structure

The mobile application follows this general flow:

```text
Screen
   │
   ▼
Cubit / BLoC
   │
   ▼
Repository
   │
   ▼
ApiService
   │
   ▼
Backend API
```

Each layer has a specific responsibility.

---

## Project Structure

```text
mobile/
└── lib/
    ├── core/
    │   ├── constants/
    │   ├── network/
    │   ├── theme/
    │   └── widgets/
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── dispense/
    │   ├── inventory/
    │   ├── missing_medicines/
    │   ├── onboarding/
    │   ├── orders/
    │   ├── scanner/
    │   └── splash/
    │
    ├── shared/
    │   ├── data/
    │   └── models/
    │
    └── main.dart
```

---

## Core Layer

The `core` layer contains components shared across the application.

```text
core/
├── constants/
├── network/
├── theme/
└── widgets/
```

### Constants

Contains application-wide constants such as colors.

### Network

Contains the centralized `ApiService` responsible for communication with the backend.

### Theme

Contains the global Flutter application theme.

### Widgets

Contains reusable UI components such as:

```text
PrimaryButton
AppTextField
MedicineCard
StepProgress
```

---

## Features Layer

The `features` layer organizes the application by business functionality.

Current features include:

```text
auth
dashboard
dispense
inventory
missing_medicines
onboarding
orders
scanner
splash
```

Each feature contains the components required for its functionality, such as screens, Cubits, and repositories.

---

## State Management

The application uses **Flutter BLoC/Cubit** for state management.

Current Cubit-based features include:

```text
auth
dashboard
dispense
inventory
scanner
```

The general flow is:

```text
User Interaction
       │
       ▼
     Screen
       │
       ▼
      Cubit
       │
       ▼
    New State
       │
       ▼
   UI Update
```

Cubits handle feature-related business logic and expose states that are consumed by the UI.

---

## Repository Layer

Repositories separate data access from business logic.

For example, authentication follows:

```text
AuthCubit
    │
    ▼
AuthRepository
    │
    ▼
ApiService
```

The repository handles feature-specific data operations, while `ApiService` handles HTTP communication.

---

## Shared Layer

The `shared` layer contains reusable data components used by multiple features.

Current shared models include:

```text
MedicineModel
MissingMedicineModel
UserModel
```

The shared data layer also contains:

```text
medicine_repository.dart
```

which provides medicine-related data operations.

---

## Authentication Architecture

Authentication follows the same layered structure:

```text
Login / Registration Screen
           │
           ▼
       AuthCubit
           │
           ▼
     AuthRepository
           │
           ▼
       ApiService
           │
           ▼
      Backend API
```

After successful authentication, the received token is stored locally and the application moves to the authenticated state.

---

## Separation of Responsibilities

| Layer        | Responsibility               |
| ------------ | ---------------------------- |
| Screens      | UI and user interaction      |
| Cubit / BLoC | State and business logic     |
| Repository   | Feature-specific data access |
| ApiService   | HTTP communication           |
| Models       | Data representation          |
| Core Widgets | Reusable UI components       |

---

## Architecture Principles

The mobile application follows these principles:

- **Feature-based organization**
- **Separation of concerns**
- **Cubit/BLoC state management**
- **Repository-based data access**
- **Centralized API communication**
- **Reusable components**
- **Shared data models**
- **Modular and maintainable structure**

---

## Architecture Summary

```text
                    Flutter Application
                           │
          ┌────────────────┴────────────────┐
          │                                 │
        Core                             Features
          │                                 │
    Shared Services              ┌──────────┴──────────┐
    UI Components                │                     │
    Theme / Constants          Screens              Cubits
                                  │                     │
                                  └─────────┬───────────┘
                                            │
                                      Repositories
                                            │
                                        ApiService
                                            │
                                            ▼
                                      Backend API
```
