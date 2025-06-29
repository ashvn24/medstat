# Firebase Setup Guide for Medistat Payment System

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "medistat-payments"
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter app nickname: "medistat-web"
6. Click "Register app"
7. Copy the firebaseConfig object

## Step 4: Update Firebase Configuration

1. Open `src/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

1. In Firestore Database, go to "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payments/{document} {
      allow read, write: if true; // For development - change this for production
    }
  }
}
```

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Complete a test payment
3. Check Firebase Console → Firestore Database to see the data
4. Use browser console to export data:
   - `window.exportPaymentData()` - Export to CSV
   - `window.fetchPaymentData()` - View all payments

## Data Structure

Each payment document in Firestore will contain:
- `timestamp`: When payment was submitted
- `name`: Customer name
- `email`: Customer email
- `phone`: Customer phone
- `upiId`: Customer UPI ID
- `institution`: Customer institution
- `amount`: Package price
- `packageName`: Selected package
- `transactionId`: Auto-generated transaction ID
- `qrGeneratedTime`: When QR was generated
- `completeButtonClickedTime`: When user clicked Complete
- `status`: Payment status (pending/completed)

## Production Security

For production, update Firestore rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payments/{document} {
      allow read: if request.auth != null;
      allow write: if true; // Allow writes from your app
    }
  }
}
```

## Benefits of Firebase

✅ **Real-time data**: Instant updates
✅ **No CORS issues**: Direct API access
✅ **Scalable**: Handles any amount of data
✅ **Secure**: Built-in security rules
✅ **Exportable**: Easy data export
✅ **Free tier**: Generous free limits