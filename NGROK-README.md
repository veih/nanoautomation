# Ngrok Integration for NanoFront

This document explains how to use ngrok with the NanoFront project to expose your local development server to the internet.

## What is Ngrok?

Ngrok is a tool that creates secure tunnels to your localhost, allowing you to expose your local development server to the internet. This is useful for:
- Testing webhooks
- Sharing your local development with others
- Testing on mobile devices
- Integration testing with external services

## Setup Options

### Option 1: Using Batch Files (Windows)

The project includes several batch files for different scenarios:

1. **servidorApp.bat** - Standard production server startup
2. **servidorApp-com-ngrok.bat** - Interactive menu with ngrok options
3. **dev-ngrok.bat** - Development server with ngrok
4. **ngrok-start.bat** - Simple ngrok startup

### Option 2: Using npm scripts

The project also includes npm scripts for ngrok integration:

```bash
# Install ngrok (if not already installed)
npm install ngrok --save-dev

# Run development server with ngrok
npm run dev-ngrok

# Run ngrok separately (after starting dev server)
npm run ngrok
```

## Installation

### Method 1: Via npm (Recommended)

```bash
npm install ngrok --save-dev
```

### Method 2: Global Installation

```bash
npm install -g ngrok
```

Then authenticate with your ngrok account:
```bash
ngrok config add-authtoken <your-authtoken>
```

### Method 3: Download from ngrok.com

1. Visit https://ngrok.com/download
2. Download the Windows version
3. Extract and add to your system PATH
4. Authenticate with your token

## Usage

### Development Server with Ngrok

For development (port 3001):
```bash
# Using batch file
dev-ngrok.bat

# Using npm script
npm run dev-ngrok
```

### Production Server with Ngrok

For production (port 3000):
```bash
# Build the application first
npm run build

# Start server with ngrok
ngrok-start.bat
```

## Configuration

Ngrok will automatically use the following ports:
- Development server: Port 3001
- Production server: Port 3000

## Accessing Your Application

Once ngrok is running, you'll see URLs like:
```
https://abcd1234.ngrok.io
```

You can share these URLs with anyone to access your local development server from anywhere.

## Troubleshooting

### Common Issues

1. **"ngrok is not recognized"** - Make sure ngrok is installed and added to your PATH
2. **Authentication required** - Run `ngrok config add-authtoken <your-token>`
3. **Port already in use** - Make sure no other ngrok instances are running

### Port Configuration

If you need to change ports, modify the batch files or npm scripts accordingly:

```bash
# For different ports
ngrok http 8080
```

## Security Considerations

- Only expose your server when necessary
- Use ngrok's authentication features
- Be cautious about exposing sensitive data
- Consider using ngrok's whitelist features for production testing

## Additional Resources

- [Ngrok Documentation](https://ngrok.com/docs)
- [Ngrok Dashboard](https://dashboard.ngrok.com)