// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Remove or comment out the import for getAnalytics
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD-y7cHfAcxRTukfl_1QNud7xHLpu4XU-U",
  authDomain: "fir-domanapp-719a0.firebaseapp.com",
  projectId: "fir-domanapp-719a0",
  storageBucket: "fir-domanapp-719a0.appspot.com",
  messagingSenderId: "445522928682",
  appId: "1:445522928682:web:feacbbcb3e6dd606714f53",
  // measurementId: "G-NP6PRQ7SNQ", // not used in React Native
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Just export storage (and app if needed)
export const storage = getStorage(app);
// Do not call getAnalytics(app) in React Native

// If you need to export the app object:
export { app };
