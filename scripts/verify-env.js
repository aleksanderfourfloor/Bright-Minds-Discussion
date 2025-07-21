#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set up correctly.
 * Run this script to verify your configuration before starting the app.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment variables...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env file not found!');
  console.log('📝 Please create a .env file in the root directory.');
  console.log('💡 You can copy env.example to .env as a starting point:');
  console.log('   cp env.example .env');
  console.log('\n🔧 Then edit .env with your actual API keys.\n');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env file
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

console.log('📋 Environment Variables Status:\n');

// Check required variables
const requiredVars = [
  'REACT_APP_GMI_API_KEY'
];

const optionalVars = [
  'REACT_APP_GMI_API_URL',
  'REACT_APP_ELEVENLABS_API_KEY'
];

let allRequiredPresent = true;

// Check required variables
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value !== 'your_gmi_api_key_here') {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing or using placeholder`);
    allRequiredPresent = false;
  }
});

console.log('');

// Check optional variables
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value && !value.includes('your_') && !value.includes('placeholder')) {
    console.log(`✅ ${varName}: Set`);
  } else if (value && (value.includes('your_') || value.includes('placeholder'))) {
    console.log(`⚠️  ${varName}: Using placeholder (optional)`);
  } else {
    console.log(`ℹ️  ${varName}: Not set (optional)`);
  }
});

console.log('');

// Security check
const securityIssues = [];
if (envContent.includes('your_gmi_api_key_here')) {
  securityIssues.push('GMI API key is using placeholder value');
}
if (envContent.includes('your_elevenlabs_api_key_here')) {
  securityIssues.push('ElevenLabs API key is using placeholder value');
}

if (securityIssues.length > 0) {
  console.log('⚠️  Security Issues Found:');
  securityIssues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('');
}

// Final status
if (allRequiredPresent) {
  console.log('🎉 Environment setup looks good!');
  console.log('🚀 You can now run: npm start');
} else {
  console.log('❌ Environment setup incomplete.');
  console.log('🔧 Please fix the issues above before starting the app.');
}

console.log('\n📚 For help, see the README.md file.'); 