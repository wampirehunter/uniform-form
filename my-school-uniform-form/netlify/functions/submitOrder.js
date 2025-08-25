// This file should be saved as:
// /netlify/functions/submitOrder.js

// Import the Firebase Admin SDK
const admin = require('firebase-admin');

// Load Firebase credentials from environment variables
const serviceAccount = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
    "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
};

exports.handler = async (event, context) => {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
        };
    }

    try {
        console.log("🔹 Incoming request body:", event.body);

        // Parse the form data
        const formData = JSON.parse(event.body);

        // Initialize Firebase Admin SDK (only once)
        if (!admin.apps.length) {
            console.log("🔹 Initializing Firebase...");
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        const db = admin.firestore();

        // Prepare data to save
        const submissionData = {
            ...formData,
            submissionDate: new Date().toISOString(),
        };

        console.log("🔹 Saving data to Firestore:", submissionData);

        // Save to Firestore collection "orders"
        const docRef = await db.collection('orders').add(submissionData);

        console.log("✅ Successfully submitted order:", docRef.id);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Order submitted successfully!",
                docId: docRef.id
            }),
        };

    } catch (error) {
        console.error("❌ Error submitting order:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: error.message || "Unknown error"
            }),
        };
    }
};
