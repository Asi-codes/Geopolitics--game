Geopolitics Game (INF4001 Entrance Exam)

Name: Asive Ave Magqabi
Student number:MGQASI005

Links
- Live game: https://asi-codes.github.io/Geopolitics--game/
- Source code: this GitHub repository (Asi-codes/Geopolitics--game)

Login for the markers
- Email: marker@example.com
- Password: Marker2026

(Anyone can also use "Create Account" on the page to make their own login.)

How to play

1. Open the live game and log in.
2. Choose your country and press Start New Game. You get 9 random computer opponents.
3. The computer players take their turns first if they go first. Every decision is shown in the Game log with a reason.
4. On your turn you can place new soldiers (from round 2), move soldiers between your own countries (not during an attack), roll dice to attack one country, and then press End Turn.
5. Tick "Fast-forward" to speed up the computer turns. You still see every move.
6. You win by conquering all 10 countries.

What is in this project

- index.html: the page, the login, and the game screen
- game.js: the rules of the game (classes Country and Game: soldiers, dice battles, conquering, turns, rounds)
- npc.js: the computer players (how they place soldiers, choose a target, and decide when to stop)
- countries.js: the list of countries and their populations (from Worldometers, as in the exam paper)
- database.js: the database layer (saving a game, saving its progress, and watching a game live)
- firestore.rules: the database security rules

Technology

HTML, CSS and JavaScript. Firebase Authentication (login). Firestore (NoSQL database). GitHub Pages (hosting). Firebase AI Logic with Gemini (AI battle commentary).

Database design (Firestore)

- users: one document per user (email, createdAt)
- games: one document per game (ownerId, status, winner, round, turnIndex, players, countries, log, createdAt, updatedAt). The log holds the last 300 lines of the game log.

Watching a game

After you start a game, a share link appears under the board. Anyone who opens that link can watch the game live, without logging in. They can only look. They cannot play or change anything.

Security

- You must be logged in to play.
- Visitors who are not logged in can watch a game but cannot change it.
- Firestore rules: anyone can read a game, but only the logged-in owner can create or change it. Each person can only read and write their own user document.
- The login form is checked before it is sent (email filled in, password at least 6 characters).
- The game rules are enforced in game.js (for example, an attacker always keeps at least 1 soldier at home).

How the computer players decide

- Half of their new soldiers go to their strongest country (to attack) and half to their weakest country (to defend).
- They attack the weakest enemy country, but only if they have at least 2 more soldiers than the target.
- They keep fighting while they have more soldiers than the target, then stop.
- After conquering a country they move half of their spare soldiers into it.
- Every decision is shown in the log with a short reason.

AI commentary

Each battle can be sent to Gemini through Firebase AI Logic, which returns one short commentary line for the log. To stay inside the free limit, not every battle gets commentary. If the AI is not available, the game carries on without it.


 Running it yourself
 
It is a website with no build step. Download the ZIP, then open the folder with a simple local web server (for example the "Live Server" extension in VS Code), because the JavaScript files are loaded as modules. To use your own Firebase project, replace firebaseConfig in index.html, turn on Email/Password sign-in, create a Firestore database, and publish firestore.rules.

## What is not finished
- NPC difficulty levels and the other bonus ideas.
- The computer players only move soldiers right after a conquest.
- AI commentary is skipped for some battles (to stay inside the free limit) and when Google's AI is busy or unavailable.
