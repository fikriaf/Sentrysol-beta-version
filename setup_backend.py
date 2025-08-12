#!/usr/bin/env python3
"""
SentrySol Backend Setup Script
This script helps set up the Python backend environment.
"""

import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        create_env_template()
        return False
    
    required_vars = ['HELIUS_API_KEY', 'METASLEUTH_API_KEY', 'MISTRAL_API_KEY']
    missing_vars = []
    
    with open('.env', 'r') as f:
        env_content = f.read()
        for var in required_vars:
            if f"{var}=" not in env_content:
                missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ .env file found with required variables")
    return True

def create_env_template():
    """Create a template .env file"""
    template = """# SentrySol Backend Environment Variables
HELIUS_API_KEY=your_helius_api_key_here
METASLEUTH_API_KEY=your_metasleuth_api_key_here  
MISTRAL_API_KEY=your_mistral_api_key_here
LLM_MODEL=mistral-medium
"""
    with open('.env.template', 'w') as f:
        f.write(template)
    print("📝 Created .env.template file - please copy to .env and fill in your API keys")

def main():
    print("🚀 SentrySol Backend Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Check environment file
    if not check_env_file():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    print("\n✅ Setup complete!")
    print("\n📋 Next steps:")
    print("1. Make sure your .env file has valid API keys")
    print("2. Run the backend server: uvicorn server:app --reload")
    print("3. Backend will be available at: http://localhost:8000")
    print("4. Start the frontend development server")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
