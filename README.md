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
2. Choose your country and the computer difficulty (Easy, Normal or Hard), then press Start New Game. You get 9 random computer opponents.
3. The computer players take their turns first if they go first. Every decision is shown in the Game log with a reason.
4. On your turn you can place new soldiers (from round 2), move soldiers between your own countries (not during an attack), roll dice to attack one country, and then press End Turn.
5. Tick "Fast-forward" to speed up the computer turns. You still see every move.
6. You win by conquering all 10 countries.

What is in this project

- index.html: the page, the login, and the game screen
- game.js: the rules of the game (classes Country and Game: soldiers, dice battles, conquering, turns, rounds)
- npc.js: the computer players (how they place soldiers, choose a target, decide when to stop, and the difficulty levels)
- countries.js: the list of countries and their populations (from Worldometers, as in the exam paper)
- database.js: the database layer (saving a game, saving its progress, and watching a game live)
- firestore.rules: the database security rules

Technology

HTML, CSS and JavaScript. Firebase Authentication (login). Firestore (NoSQL database). GitHub Pages (hosting). Firebase AI Logic with Gemini (for the AI battle commentary, see below).

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

Bonus feature: difficulty levels

The player chooses Easy, Normal or Hard before starting a game. The level changes how the computer players behave:
- Easy: they only attack when they have at least 4 more soldiers than their target, they put all new soldiers on their strongest country, and they do not move soldiers after a conquest.
- Normal: they attack when they have at least 2 more soldiers than their target, they split new soldiers between attacking and defending, and they move soldiers into a conquered country.
- Hard: the same as Normal, but they attack with only 1 more soldier than their target, and they go for the human player's weakest country first.
The level is saved with the game and shown to people who watch it.

How the computer players decide (Normal level)

- Half of their new soldiers go to their strongest country (to attack) and half to their weakest country (to defend).
- They attack the weakest enemy country, but only if they have at least 2 more soldiers than the target.
- They keep fighting while they have more soldiers than the target, then stop.
- After conquering a country they move half of their spare soldiers into it.
- Every decision is shown in the log with a short reason.

 AI commentary
 
After a battle, the game sends the battle to Gemini (Google's AI) through Firebase AI Logic and shows one short commentary line in the Game log, starting with "Commentator:". The code is in index.html (the functions setupAI and askForCommentary). It tries a few Gemini models in turn. To stay inside the free limit, not every battle gets commentary, and if Google's AI is busy the game carries on without it.
One known problem: I set up App Check (reCAPTCHA) to protect the AI, but the browser Console still shows a reCAPTCHA error. The AI answered during my tests anyway, but I did not manage to fix the App Check error.

Running it yourself

It is a website with no build step. Download the ZIP, then open the folder with a simple local web server (for example the "Live Server" extension in VS Code), because the JavaScript files are loaded as modules. To use your own Firebase project, replace firebaseConfig in index.html, turn on Email/Password sign-in, create a Firestore database, and publish firestore.rules.

What is not finished

- Fixing the App Check (reCAPTCHA) error that shows in the browser Console (see the AI commentary section above).
- The other bonus ideas (analytics, replays, alliances, and so on).
- The computer players only move soldiers right after a conquest (on Normal and Hard).
- AI commentary is skipped for some battles, and when Google's AI is busy.

AI use


I used an AI assistant (Claude) to help write and explain some code.
