// game.js: the rules of the game.
// This file has no HTML and no Firebase in it. It only knows how the game works.

// How many soldiers a country gets, based on its population
export function soldiersForPopulation(population) {
    if (population <= 5000000) {
        return 1;
    } else if (population <= 10000000) {
        return 2;
    } else if (population <= 25000000) {
        return 3;
    } else if (population <= 50000000) {
        return 4;
    } else if (population <= 75000000) {
        return 5;
    } else if (population <= 100000000) {
        return 6;
    } else if (population <= 125000000) {
        return 7;
    } else if (population <= 150000000) {
        return 8;
    } else {
        return 9;
    }
}

// Roll one die: a random whole number from 1 to 6
export function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Turn the result of one battle round into a sentence
export function describeBattle(attackerName, defenderName, result) {
    let text = attackerName + " rolled " + result.attackerDice.join(", ") + ". " +
        defenderName + " rolled " + result.defenderDice.join(", ") + ". " +
        attackerName + " lost " + result.attackerLost + " soldier(s) and " +
        defenderName + " lost " + result.defenderLost + ".";

    if (result.conquered) {
        text = text + " " + attackerName + " conquered " + defenderName +
            " and gained " + result.gained + " soldiers there!";
    } else if (result.failed) {
        text = text + " The attack failed: " + attackerName + " has only 1 soldier left.";
    }
    return text;
}

// A Country is one place on the board
export class Country {
    constructor(name, population, heldBy) {
        this.name = name;
        this.population = population;
        this.heldBy = heldBy;   // the player who controls this country

        // The underscore means "private": other code should use the
        // methods below instead of changing _soldiers directly.
        this._soldiers = soldiersForPopulation(population);
    }

    getSoldiers() {
        return this._soldiers;
    }

    addSoldiers(amount) {
        this._soldiers = this._soldiers + amount;
    }

    loseSoldiers(amount) {
        this._soldiers = this._soldiers - amount;
        if (this._soldiers < 0) {
            this._soldiers = 0;
        }
    }
}

// A Game is one whole game with 10 countries and 10 players
export class Game {
    constructor(allCountries, yourCountryName, level) {
        this.round = 1;
        this.level = level || "normal";   // how clever the computer players are: easy, normal or hard
        this.turnsThisRound = 0;   // how many turns have been played in this round
        this.countries = [];
        this.players = [];

        // Split the list into your country and all the others
        let yours = null;
        let others = [];
        for (let c of allCountries) {
            if (c.name === yourCountryName) {
                yours = c;
            } else {
                others.push(c);
            }
        }

        // You are the first player
        this.addPlayer(yours, false);

        // Pick 9 random countries to be the computer players
        for (let n = 0; n < 9; n++) {
            let randomNumber = Math.floor(Math.random() * others.length);
            let chosenCountry = others[randomNumber];
            this.addPlayer(chosenCountry, true);
            others.splice(randomNumber, 1);   // remove it so it cannot be picked twice
        }

        // Pick who goes first
        this.turnIndex = Math.floor(Math.random() * 10);
    }

    // Every player starts holding one country: their own
    addPlayer(country, isNPC) {
        this.players.push({ name: country.name, isNPC: isNPC, eliminated: false });
        this.countries.push(new Country(country.name, country.population, country.name));
    }

    // The human player is always the first one in the list
    getHumanName() {
        return this.players[0].name;
    }

    getCurrentPlayerName() {
        return this.players[this.turnIndex].name;
    }

    getCurrentPlayer() {
        return this.players[this.turnIndex];
    }

    // Find a player by name
    getPlayer(name) {
        for (let p of this.players) {
            if (p.name === name) {
                return p;
            }
        }
        return null;
    }

    // All the countries that one player holds
    getCountriesHeldBy(playerName) {
        let list = [];
        for (let c of this.countries) {
            if (c.heldBy === playerName) {
                list.push(c);
            }
        }
        return list;
    }

    // From round 2 onwards a player gets 2 new soldiers for every country they hold
    giveReinforcements(playerName) {
        if (this.round < 2) {
            return 0;
        }
        return 2 * this.getCountriesHeldBy(playerName).length;
    }

    // How many players are still in the game
    countActivePlayers() {
        let count = 0;
        for (let p of this.players) {
            if (!p.eliminated) {
                count = count + 1;
            }
        }
        return count;
    }

    // Finish the current turn and move to the next player who is still in the game.
    // A round is finished when every player still in the game has had one turn.
    endTurn() {
        this.turnsThisRound = this.turnsThisRound + 1;
        if (this.turnsThisRound >= this.countActivePlayers()) {
            this.round = this.round + 1;
            this.turnsThisRound = 0;
        }

        this.turnIndex = (this.turnIndex + 1) % this.players.length;
        while (this.players[this.turnIndex].eliminated) {
            this.turnIndex = (this.turnIndex + 1) % this.players.length;
        }
    }

    // Find a country by its name
    getCountry(name) {
        for (let c of this.countries) {
            if (c.name === name) {
                return c;
            }
        }
        return null;
    }

    // Fight ONE round between an attacking country and a defending country.
    // Each side rolls one die per soldier who can fight. The higher die wins.
    fightOneRound(attackerName, defenderName) {
        let attacker = this.getCountry(attackerName);
        let defender = this.getCountry(defenderName);

        // The attacker must leave 1 soldier at home, so it can fight with soldiers - 1
        let attackerFighters = attacker.getSoldiers() - 1;
        let defenderFighters = defender.getSoldiers();

        // The number of dice is the smaller of the two sides
        let numberOfDice = Math.min(attackerFighters, defenderFighters);

        let result = {
            attackerDice: [],
            defenderDice: [],
            attackerLost: 0,
            defenderLost: 0,
            conquered: false,
            failed: false,
            gained: 0
        };

        for (let i = 0; i < numberOfDice; i++) {
            let attackRoll = rollDie();
            let defenceRoll = rollDie();
            result.attackerDice.push(attackRoll);
            result.defenderDice.push(defenceRoll);

            if (attackRoll > defenceRoll) {
                result.defenderLost = result.defenderLost + 1;
            } else if (defenceRoll > attackRoll) {
                result.attackerLost = result.attackerLost + 1;
            }
            // If the dice are equal, nobody loses a soldier
        }

        attacker.loseSoldiers(result.attackerLost);
        defender.loseSoldiers(result.defenderLost);

        if (defender.getSoldiers() === 0) {
            // The defender has no soldiers left, so the attacker conquers it
            result.conquered = true;
            result.gained = Math.max(2, Math.floor(soldiersForPopulation(defender.population) / 2));
            defender.heldBy = attacker.heldBy;
            defender.addSoldiers(result.gained);
            this.updateEliminatedPlayers();
        } else if (attacker.getSoldiers() === 1) {
            // The attacker only has 1 soldier left, so the attack ends
            result.failed = true;
        }

        return result;
    }

    // A player is eliminated when they hold no countries
    updateEliminatedPlayers() {
        for (let p of this.players) {
            let count = 0;
            for (let c of this.countries) {
                if (c.heldBy === p.name) {
                    count = count + 1;
                }
            }
            p.eliminated = (count === 0);
        }
    }

    // Move soldiers between two countries held by the same player.
    // Gives back "" if it worked, or a sentence that explains the problem.
    transferSoldiers(fromName, toName, amount) {
        let from = this.getCountry(fromName);
        let to = this.getCountry(toName);

        if (from === null || to === null || fromName === toName) {
            return "Choose two different countries.";
        }
        if (from.heldBy !== to.heldBy) {
            return "You can only move soldiers between countries you hold.";
        }
        if (!(amount >= 1)) {
            return "Enter a number of soldiers that is 1 or more.";
        }
        if (from.getSoldiers() - amount < 1) {
            return fromName + " must keep at least 1 soldier.";
        }

        from.loseSoldiers(amount);
        to.addSoldiers(amount);
        return "";
    }

    // If one player holds every country they win. Otherwise give back null.
    getWinner() {
        let first = this.countries[0].heldBy;
        for (let c of this.countries) {
            if (c.heldBy !== first) {
                return null;
            }
        }
        return first;
    }

    // Firestore can only save plain data, so copy the game into simple objects
    getDataToSave() {
        let countryData = [];
        for (let c of this.countries) {
            countryData.push({
                name: c.name,
                population: c.population,
                soldiers: c.getSoldiers(),
                heldBy: c.heldBy
            });
        }

        let status = "playing";
        if (this.getWinner() !== null) {
            status = "finished";
        }

        return {
            status: status,
            winner: this.getWinner(),
            level: this.level,
            round: this.round,
            turnIndex: this.turnIndex,
            players: this.players,
            countries: countryData
        };
    }
}
