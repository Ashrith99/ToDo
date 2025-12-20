#!/bin/bash

echo "🚀 Setting up Todo App - Full Stack"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Setup Instructions:"
echo "1. Make sure MongoDB is running on your system"
echo "2. Update server/.env with your MongoDB connection string if needed"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "🌐 Application URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "🎉 Setup complete! Run 'npm run dev' to start the application."