import { getReqTime, createPaymentLink, encryptRSA } from "./src/lib/payway";
import crypto from "crypto";

// Load env vars manually for the script if not using next's loader
import dotenv from "dotenv";
dotenv.config();

const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID || "ec462940";
const API_KEY = process.env.PAYWAY_API_KEY || "86403073";

console.log("--- PayWay Debug Config ---");
console.log("MERCHANT_ID:", MERCHANT_ID);
console.log("API_KEY (first 4):", API_KEY ? API_KEY.substring(0, 4) + "..." : "UNDEFINED");
console.log("API_KEY Length:", API_KEY ? API_KEY.length : 0);

if (MERCHANT_ID === "ec462940" && API_KEY === "86403073") {
    console.warn("WARNING: You are using the DEFAULT Demo Credentials hardcoded in verify_credentials.ts (or defaulting). Ensure your .env file is loaded.");
} else if (MERCHANT_ID === "ec462940" && API_KEY !== "86403073") {
    console.warn("WARNING: You are using Demo Merchant ID but a CUSTOM API Key. This will likely fail hashing.");
} else if (MERCHANT_ID !== "ec462940" && API_KEY === "86403073") {
    console.warn("WARNING: You are using Custom Merchant ID but Default Demo API Key. This will DEFINITELY fail hashing.");
}

async function testHashing() {
    const reqTime = "20230101000000";
    const merchantId = MERCHANT_ID;
    
    // Simulate dummy merchant_auth (usually large base64 string)
    // We'll just use a small string for hashing check, though real one is RSA encrypted
    const dummyAuth = "dummy_encrypted_data_base64";
    
    const b4hash = reqTime + merchantId + dummyAuth;
    console.log("\n--- Hashing Test ---");
    console.log("String to Hash:", b4hash);
    
    const hmac = crypto.createHmac("sha512", API_KEY);
    hmac.update(b4hash);
    const hash = hmac.digest("base64");
    console.log("Generated Hash:", hash);
    
    console.log("\nIf you see 'Wrong Hash' from PayWay, checking the API_KEY matches the MERCHANT_ID in the PayWay dashboard is the #1 fix.");
}

testHashing();
