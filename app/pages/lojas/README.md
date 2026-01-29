# Lojas Management System

## Overview
This directory contains two implementations of the Lojas (Stores) management system:

1. **Advanced Version** (`/app/pages/lojas/page.tsx`) - Full-featured management with tabs for Lojas, Equipamentos, Atuadores, and Sensores
2. **Simplified Version** (`/app/pages/lojas/simplified/page.tsx`) - Streamlined interface focused on essential store information

## Simplified Version Features

The simplified version presents a cleaner, more user-friendly interface that displays the most important information for store management:

### Key Information Displayed
- **Lojas** (Store Name)
- **LUC** (Unique Store Code)
- **Piso** (Floor)
- **Smart** (Smart status)
- **ID Kron**
- **Atuador Status** (Actuator operational percentage)
- **Sensores Status** (Sensor operational percentage)
- **Ações** (Actions: View Details, Edit, Delete)

### User-Friendly Features
1. **Status Indicators**: Color-coded badges show the health of actuators and sensors
2. **Percentage View**: Quick overview of operational equipment
3. **Simplified Forms**: Easy-to-use forms for creating and editing stores
4. **Search Functionality**: Filter stores by any field
5. **Detailed Modal View**: See all store information and equipment in a clean modal

## API Endpoints

### Simplified API
- `GET /api/lojasApi/simplified` - Get all stores with summary information
- `POST /api/lojasApi/simplified` - Create a new store
- `GET /api/lojasApi/simplified/[id]` - Get a specific store with details
- `PUT /api/lojasApi/simplified/[id]` - Update a specific store
- `DELETE /api/lojasApi/simplified/[id]` - Delete a specific store

## Switching Between Views
Users can easily switch between the advanced and simplified views using the toggle button at the top of each page.

## Development
To modify the simplified version:
1. Frontend: `/app/pages/lojas/simplified/page.tsx`
2. Backend API: `/pages/api/lojasApi/simplified/`