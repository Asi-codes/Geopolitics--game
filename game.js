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
    constructor(allCountries, yourCountryName) {
        this.round = 1;
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

    getCurrentPlayerName() {
        return this.players[this.turnIndex].name;
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

        return {
            status: "playing",
            round: this.round,
            turnIndex: this.turnIndex,
            players: this.players,
            countries: countryData
        };
    }
}
