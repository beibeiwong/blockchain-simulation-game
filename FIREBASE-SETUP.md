# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `blockchain-classroom-game`
4. Disable Google Analytics (not needed)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (allows read/write for 30 days)
4. Select your preferred location (closest to your students)
5. Click "Done"

## Step 3: Get Web App Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register app name: "Blockchain Game"
5. **Don't check "Firebase Hosting"** (you're using GitHub Pages)
6. Click "Register app"
7. **Copy the config object** - you'll need this!

## Step 4: Update Your Code

1. Open `script.js` in your project
2. Find this section at the top:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    // ... more config
};
```
3. **Replace the entire config object** with your Firebase config
4. Save the file

## Step 5: Set Database Rules (Optional but Recommended)

1. In Firebase Console, go to "Realtime Database" > "Rules"
2. Replace the rules with:
```json
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
```
3. Click "Publish"

## Step 6: Deploy to GitHub

1. Commit your changes to GitHub:
```bash
git add script.js
git commit -m "Add Firebase real-time sync"
git push origin main
```
2. Wait 2-3 minutes for GitHub Pages to update
3. Test your live site!

## Testing Your Setup

1. **Visit your GitHub Pages URL**
2. **Create a session as instructor**
3. **Open another browser/tab and join as student**
4. **Mine a block as student** - instructor should see it immediately!
5. **Check Firebase Console** - you should see data under "Realtime Database"

## Troubleshooting

### "Firebase is not defined" error:
- Make sure the Firebase CDN scripts are loaded in `index.html`
- Check browser console for network errors

### "Permission denied" error:
- Check your database rules allow read/write access
- Make sure you're using the correct database URL

### Data not syncing:
- Check browser console for errors
- Verify your Firebase config is correct
- Make sure you're connected to the internet

### Session not found:
- Check that the session was created successfully
- Look in Firebase Console > Realtime Database to see if data exists

## Firebase Console Monitoring

You can monitor your classroom sessions in real-time:
1. Go to Firebase Console > Realtime Database
2. Expand `sessions` > `your-session-id`
3. Watch as students join and mine blocks!

## Cost Considerations

Firebase Realtime Database free tier includes:
- **1GB stored data**
- **10GB/month data transfer**
- **100 concurrent connections**

This is more than enough for classroom use (80 students max).