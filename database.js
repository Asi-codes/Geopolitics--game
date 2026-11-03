// database.js: everything that talks to the database lives in this file.

import { collection, addDoc, serverTimestamp }
from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Save a brand new game and give back its ID
export async function saveNewGame(db, userId, gameData) {
    gameData.ownerId = userId;
    gameData.createdAt = serverTimestamp();

    let reference = await addDoc(collection(db, "games"), gameData);
    return reference.id;
}
