// database.js: everything that talks to the database lives in this file.

import { collection, addDoc, doc, updateDoc, onSnapshot, serverTimestamp }
from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Save a brand new game and give back its ID
export async function saveNewGame(db, userId, gameData) {
    gameData.ownerId = userId;
    gameData.createdAt = serverTimestamp();

    let reference = await addDoc(collection(db, "games"), gameData);
    return reference.id;
}

// Save the latest state of a game together with its log
export async function updateGame(db, gameId, gameData, logLines) {
    gameData.log = logLines;
    gameData.updatedAt = serverTimestamp();

    await updateDoc(doc(db, "games", gameId), gameData);
}

// Watch a game. The function you give is called every time the game changes.
// If the game cannot be found or read, it is called with null.
export function watchGame(db, gameId, whenChanged) {
    return onSnapshot(
        doc(db, "games", gameId),
        function(snapshot) {
            if (snapshot.exists()) {
                whenChanged(snapshot.data());
            } else {
                whenChanged(null);
            }
        },
        function(error) {
            whenChanged(null);
        }
    );
}
