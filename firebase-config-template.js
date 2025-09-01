// Firebase Configuration Template
// 
// INSTRUCTIONS:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Create a new project (or use existing one)
// 3. Go to Project Settings > General > Your apps
// 4. Click "Add app" and select Web (</>) 
// 5. Copy the config object and replace the values below
// 6. Copy this entire config object and replace the firebaseConfig in script.js

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};

// SECURITY RULES FOR FIREBASE REALTIME DATABASE:
// Go to Firebase Console > Realtime Database > Rules
// Replace the rules with this:

/*
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['sessionId', 'gameState', 'participants', 'settings'])"
      }
    }
  }
}
*/

// This allows read/write access to session data for all users
// For production, you might want to add authentication