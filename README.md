# FastAPI-React-Spark PAMAP2 Analysis Platform

## Overview

This application provides an interface for querying and analyzing the PAMAP2 physical activity monitoring dataset using Apache Spark as the processing engine, FastAPI for the backend API, and React for the frontend interface.

## Project Structure

```
app
├── backend/          # FastAPI server implementation
├── frontend/         # React frontend application
├── data/
│   ├── data/        # PAMAP2 dataset files
│   ├── db_create.py # Database initialization script
│   └── requirements.txt
├── docker-compose.yml
└── requirements.txt
```

## Technologies Used

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Data Processing**: Apache Spark
- **Dataset**: PAMAP2 (Physical Activity Monitoring)

## Getting Started

### Prerequisites

- Docker
- Node.js and npm

### Installation

1. Clone the repository:

2. Start the application using Docker Compose:

```bash
docker-compose up --build
```

### Development Setup

#### Frontend

1. Navigate to the frontend directory:

```bash
cd app/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Data Processing

The application uses Apache Spark to process the PAMAP2 dataset, which contains physical activity monitoring data. The data processing pipeline includes:

- Loading and preprocessing PAMAP2 data
- Performing analytics using Spark
- Serving results through the FastAPI backend

## API Documentation

The API documentation is automatically generated and can be accessed at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
