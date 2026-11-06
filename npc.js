// npc.js: the "brain" of the computer players.
// It decides what a computer player does on its turn and explains why.
// It has no HTML in it. It gives back a list of sentences about what happened.

import { describeBattle } from "./game.js";

// Difficulty levels. Each level changes how the computer players behave.
//   attackMargin: how many MORE soldiers than its target a country needs before it attacks
//   defend:       true = half of the new soldiers go to the weakest country to protect it
//   transfer:     true = after a conquest, move half of the spare soldiers into the new country
//   targetHuman:  true = go for the human player's weakest country first
const LEVELS = {
    easy:   { attackMargin: 4, defend: false, transfer: false, targetHuman: false },
    normal: { attackMargin: 2, defend: true,  transfer: true,  targetHuman: false },
    hard:   { attackMargin: 1, defend: true,  transfer: true,  targetHuman: true }
};

// The country with the most soldiers
function findStrongest(countries) {
    let strongest = countries[0];
    for (let c of countries) {
        if (c.getSoldiers() > strongest.getSoldiers()) {
            strongest = c;
        }
    }
    return strongest;
}

// The country with the fewest soldiers
function findWeakest(countries) {
    let weakest = countries[0];
    for (let c of countries) {
        if (c.getSoldiers() < weakest.getSoldiers()) {
            weakest = c;
        }
    }
    return weakest;
}

// The weakest country held by one particular player (null if they hold none)
function findWeakestHeldBy(game, ownerName) {
    let weakest = null;
    for (let c of game.countries) {
        if (c.heldBy === ownerName) {
            if (weakest === null || c.getSoldiers() < weakest.getSoldiers()) {
                weakest = c;
            }
        }
    }
    return weakest;
}

// The weakest country that this player does not hold
function findWeakestEnemy(game, playerName) {
    let weakest = null;
    for (let c of game.countries) {
        if (c.heldBy !== playerName) {
            if (weakest === null || c.getSoldiers() < weakest.getSoldiers()) {
                weakest = c;
            }
        }
    }
    return weakest;
}

// One turn for a computer player. The level is "easy", "normal" or "hard".
export function takeNpcTurn(game, playerName, level) {
    let settings = LEVELS[level];
    if (settings === undefined) {
        settings = LEVELS.normal;
    }

    let lines = [];

    // Step 1: new soldiers (from round 2).
    // On easy, they all go to the strongest country.
    // On normal and hard, half go to the strongest country (to attack)
    // and half go to the weakest country (to defend it).
    let newSoldiers = game.giveReinforcements(playerName);
    if (newSoldiers > 0) {
        let myCountries = game.getCountriesHeldBy(playerName);
        let strongestCountry = findStrongest(myCountries);
        let weakestCountry = findWeakest(myCountries);

        let forAttack = newSoldiers;
        let forDefence = 0;
        if (settings.defend) {
            forAttack = Math.ceil(newSoldiers / 2);
            forDefence = newSoldiers - forAttack;
        }

        strongestCountry.addSoldiers(forAttack);
        if (forDefence > 0) {
            weakestCountry.addSoldiers(forDefence);
            lines.push(playerName + " received " + newSoldiers + " new soldiers: " + forAttack +
                " went to " + strongestCountry.name + " (its strongest country, to attack) and " + forDefence +
                " went to " + weakestCountry.name + " (its weakest country, to defend it).");
        } else {
            lines.push(playerName + " received " + newSoldiers + " new soldiers and put them on " +
                strongestCountry.name + ", its strongest country, to attack.");
        }
    }

    // Step 2: choose the weakest enemy country, and only attack if we are strong enough.
    let attacker = findStrongest(game.getCountriesHeldBy(playerName));
    let target = null;
    let reason = "";

    // On hard, the computer players go for the human player first (if they are strong enough)
    if (settings.targetHuman && playerName !== game.getHumanName()) {
        let humanTarget = findWeakestHeldBy(game, game.getHumanName());
        if (humanTarget !== null && attacker.getSoldiers() >= humanTarget.getSoldiers() + settings.attackMargin) {
            target = humanTarget;
            reason = " It belongs to the human player, and on hard the computer players go for you first.";
        }
    }

    // Otherwise choose the weakest enemy country
    if (target === null) {
        target = findWeakestEnemy(game, playerName);
        reason = " It is the weakest enemy country.";
    }

    if (target === null || attacker.getSoldiers() < target.getSoldiers() + settings.attackMargin) {
        lines.push(playerName + " skips its attack: " + attacker.name + " has " + attacker.getSoldiers() +
            " soldiers and no enemy is weak enough (it needs at least " + settings.attackMargin +
            " more soldiers than its target).");
        return lines;
    }

    lines.push(playerName + " attacks " + target.name + " from " + attacker.name + ". " +
        target.name + " has " + target.getSoldiers() + " soldiers and " +
        attacker.name + " has " + attacker.getSoldiers() + "." + reason);

    // Step 3: keep fighting while we have more soldiers than the target
    let rounds = 0;
    while (rounds < 50) {
        rounds = rounds + 1;
        let mine = attacker.getSoldiers();
        let theirs = target.getSoldiers();

        if (mine <= theirs) {
            lines.push(playerName + " stops the attack: " + attacker.name + " (" + mine +
                ") is no longer ahead of " + target.name + " (" + theirs + ").");
            break;
        }

        let result = game.fightOneRound(attacker.name, target.name);
        lines.push(describeBattle(attacker.name, target.name, result));

        if (result.conquered) {
            // Step 4: on normal and hard, move half of the spare soldiers into the new country
            if (settings.transfer) {
                let spare = attacker.getSoldiers() - 1;
                let move = Math.floor(spare / 2);
                if (move > 0) {
                    attacker.loseSoldiers(move);
                    target.addSoldiers(move);
                    lines.push(playerName + " moved " + move + " soldiers from " + attacker.name +
                        " into " + target.name + " to defend its new country.");
                }
            }
            break;
        }

        if (result.failed) {
            break;
        }
    }

    return lines;
}
