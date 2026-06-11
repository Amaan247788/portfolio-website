export const firebaseConfig = {
    apiKey: "AIzaSyDSlK9B5rj6iQJFogrOg6gp2OnheRKA8a4",
    authDomain: "amaan-portfolio-website.firebaseapp.com",
    databaseURL: "https://amaan-portfolio-website-default-rtdb.firebaseio.com",
    projectId: "amaan-portfolio-website",
    storageBucket: "amaan-portfolio-website.firebasestorage.app",
    messagingSenderId: "663023180745",
    appId: "1:663023180745:web:e76337951966aafb4ca618",
    measurementId: "G-JW73X5G87E"
};

export const adminUid = "Zo1qbE37FwYzgHyFlpKML6RPjOE3";

export function hasFirebaseConfig() {
    return Object.values(firebaseConfig).every(value => value && !value.startsWith("PASTE_"));
}
