// npc.js: the "brain" of the computer players.
// It decides what a computer player does on its turn and explains why.
// It has no HTML in it. It gives back a list of sentences about what happened.

import { describeBattle } from "./game.js";

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

// One turn for a computer player
export function takeNpcTurn(game, playerName) {
    let lines = [];

    // Step 1: new soldiers (from round 2).
    // Half go to the strongest country so it can attack.
    // The rest go to the weakest country so it is harder to conquer.
    let newSoldiers = game.giveReinforcements(playerName);
    if (newSoldiers > 0) {
        let myCountries = game.getCountriesHeldBy(playerName);
        let forAttack = Math.ceil(newSoldiers / 2);
        let forDefence = newSoldiers - forAttack;
        let strongestCountry = findStrongest(myCountries);
        let weakestCountry = findWeakest(myCountries);

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

    // Step 2: choose the weakest enemy country, and only attack if we are clearly stronger.
    let attacker = findStrongest(game.getCountriesHeldBy(playerName));
    let target = findWeakestEnemy(game, playerName);

    if (target === null || attacker.getSoldiers() < target.getSoldiers() + 2) {
        lines.push(playerName + " skips its attack: " + attacker.name + " has " + attacker.getSoldiers() +
            " soldiers and no enemy is weak enough (it needs at least 2 more soldiers than its target).");
        return lines;
    }

    lines.push(playerName + " attacks " + target.name + " from " + attacker.name + ". " +
        target.name + " is the weakest enemy (" + target.getSoldiers() + " soldiers) and " +
        attacker.name + " has " + attacker.getSoldiers() + ".");

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
            // Step 4: move half of the spare soldiers into the new country to defend it
            let spare = attacker.getSoldiers() - 1;
            let move = Math.floor(spare / 2);
            if (move > 0) {
                attacker.loseSoldiers(move);
                target.addSoldiers(move);
                lines.push(playerName + " moved " + move + " soldiers from " + attacker.name +
                    " into " + target.name + " to defend its new country.");
            }
            break;
        }

        if (result.failed) {
            break;
        }
    }

    return lines;
}
