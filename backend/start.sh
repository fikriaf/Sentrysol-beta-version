#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting SentrySol backend server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
