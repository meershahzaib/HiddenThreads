import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDRrQB9fsOtxq2vT1jdIqKIy0yJNnEDaeU",
  authDomain: "hidden-threads.firebaseapp.com",
  databaseURL: "https://hidden-threads-default-rtdb.firebaseio.com",
  projectId: "hidden-threads",
  storageBucket: "hidden-threads.firebasestorage.app",
  messagingSenderId: "16369816483",
  appId: "1:16369816483:web:53fddda2215270b0634016",
  measurementId: "G-7SN9L6QF3S"

};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue };
