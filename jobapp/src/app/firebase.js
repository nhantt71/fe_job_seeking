
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAIssp5Fn_n6XrRWyVA7PRFLY_pSKb6aBg",
    authDomain: "jobapp-6eac3.firebaseapp.com",
    databaseURL: "https://jobapp-6eac3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "jobapp-6eac3",
    storageBucket: "jobapp-6eac3.appspot.com",
    messagingSenderId: "400877458239",
    appId: "1:400877458239:web:8bff80253f75a9999cf98a"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
