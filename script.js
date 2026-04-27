//CITATIONS:
//Image "Cave Entrance" from StockCake https://stockcake.com/i/mysterious-cave-entrance_3619879_1718494
//Image "Inside Cave" from Shutterstock: https://www.shutterstock.com/image-vector/dark-pixel-art-cave-entrance-moss-2689681071
//Image "Crystal Cave" from Shutterstock: https://www.shutterstock.com/search/cave-pixel

//initialize variables
let textNarration = document.getElementById("textNarration");
let encounterDifficulty = 3
let fleeChance = 70
let playerHPMax = 100
let playerHP = playerHPMax
let staminaMax = 100
let stamina = staminaMax
let inventory = []
let inventoryDisplay = []
let usables = []
let combatActive = false;
let skillWorked = true;
let isProcessing = false;
let currentHandler = null;
let combatEncounters = 0;

//initialize enemy stats
let enemyHPs = [40, 80, 200]
let enemyNames = ["Cavemite", "Minion", "Guardian"]
let enemyfleeChances = [50, 40, 30]
let enemyDamageRanges = [5, 9, 15]
let enemyDamageMin = [3, 6, 15];
let enemyId = 0
let enemyHP = 0;
let enemyName = 0;

//CITATION: the built in coder ai for most of the logic of the Promise-based slowPrint function, allowing mutliple 
//calls of slowPrintAbort
//also AI helped bugfixing by adding the isProcessing variable and implementing it throughout all the places that needed to have it
let typingTimer;
let slowPrintQueue = Promise.resolve();
let slowPrintAbort = null;
let userInput = document.getElementById("playerChoice");

function setHandler(handler){
    if (currentHandler){
        userInput.removeEventListener("keydown", currentHandler);
    }

    currentHandler = handler;
    userInput.addEventListener("keydown", handler);
}

function slowPrint(target, message){
    if (slowPrintAbort) slowPrintAbort();

    let timer;
    let aborted = false;
    let rejectCurrent;
    let messageSoFar = "";
    
    // Create a named skip handler so we can remove it later
    const skipHandler = function(skip){
        if (skip.key === "qiwoptn") {
            if (slowPrintAbort) slowPrintAbort();
            target.textContent = target.textContent.slice(0, -messageSoFar.length) + message;
        }
    };
    
    userInput.addEventListener("keydown", skipHandler);
    
    slowPrintAbort = () => {
        if (aborted) return;
        aborted = true;
        clearTimeout(timer);
        userInput.removeEventListener("keydown", skipHandler);
        if (rejectCurrent) rejectCurrent(new Error("slowPrint aborted"));
    };

    const printPromise = slowPrintQueue
        .catch(() => {})
        .then(() => new Promise((resolve, reject) => {
            rejectCurrent = reject;
            if (aborted) return reject(new Error("slowPrint aborted"));
            clearTimeout(timer);

            function addLetter(i = 0){
                if (aborted) return reject(new Error("slowPrint aborted"));
                if (i < message.length){
                    target.textContent += message[i];
                    messageSoFar += message[i];
                    timer = setTimeout(() => addLetter(i + 1), 30);
                } else {
                    userInput.removeEventListener("keydown", skipHandler);
                    slowPrintAbort = null;
                    resolve();
                }
            }

            addLetter();
        }));

    slowPrintQueue = printPromise.catch(() => {});
    return printPromise;
}

function combatInit(){ // set up combat, including enemy stats, and call the combatLoop.
    enemyHP = enemyHPs[enemyId];
    combatEncounters += 1;
    enemyName = enemyNames[enemyId];
    fleeChance = enemyfleeChances[enemyId];
    playerDefMultiplier = 1;
    playerDamageMultiplier = 1;
    eventText.textContent = "";
    slowPrint(eventText, "\nYou have encountered a " + enemyName + "! \n Player HP: " + playerHP + "\n Enemy HP: " + enemyHP);
    combatLoop();
}

//GOTTA BUGFIX COMBATLOOP
async function combatLoop(){ // sets up the event listener for combat and computes the result of each option
    isProcessing = false;
    choices.textContent = "\n1. Attack \n2. Defend \n3. Skills \n4. Use Item \n5. Flee (" + fleeChance + "%)";
        async function processCombat(event){
        if(event.key === "Enter"){
            if (isProcessing) return;
            isProcessing = true;
            if (enemyHP <= 0 || playerHP <= 0){
                if (playerHP <= 0){ 
                    eventText.textContent = "Exhausted, you let your guard down for a moment, and in a flash, the " + enemyName + 
                    " strikes you down. You have been defeated, and the Artifact remains lost in the depths of the cave. \n Game Over.";
                }
                return;
            }
            let choice = userInput.value;
            userInput.value = "";
            eventText.textContent = "In Combat: " + enemyName;
            if(choice == "1"){ // basic attack
                await calculateAttack();
                if(enemyHP <= 0){
                    await slowPrint(eventText,  " You have defeated the " + enemyName + "!");
                    await combatEnd(userInput, false)
                }
                else{
                    await enemyMove(1);
                }
                isProcessing = false;
            }
            else if(choice == "2"){ // defend: reduces damage by 1/2 and regenerates 1-10 Stamina
                staminaRegained = Math.floor(Math.random()* 10);
                await slowPrint(eventText,  "\nYou raise your shield to block the next blow. You regain " + staminaRegained + " stamina.");
                stamina += staminaRegained;
                if (stamina > staminaMax){
                    stamina = staminaMax;
                }
                await enemyMove(0.5)
                isProcessing = false;
            }
            else if(choice == "3"){ //opens a skill menu
                await slowPrint(eventText,  "\nSkills Menu: \n Stamina: " + stamina);
                choices.textContent = "\n1. DOUBLESTRIKE SKILL \n2. DEFENSE SKILL \n3. HEALING SKILL \n4. STEALTH SKILL \n5. DAMAGE BOOST SKILL \n6. Cancel";
                    setHandler(skillSelect);
                    async function skillSelect(key){
                        if (key.key === "Enter"){
                            let skillChoice = userInput.value;
                            userInput.value = "";
                            if (skillChoice === "1"){
                                await useSkill(15, "double", 30);
                            }
                            else if(skillChoice === "2"){
                                await useSkill(200, "defenseBoost", 0.75);
                            }
                            else if(skillChoice === "3"){
                                await useSkill(30, "heal", 20);
                            }
                            else if(skillChoice === "4"){
                                await useSkill(50, "stealth", 0.5);
                            }
                            else if(skillChoice === "5"){
                                await useSkill(100, "damageBoost", 1.5);
                            }
                            else if(skillChoice === "6"){
                                eventText.textContent = "cancelled";
                                skillWorked = true;
                            }
                            if (skillWorked){
                                setHandler(combatLoop); // return to combat
                            }
                        }
                    }
            }
            else if(choice == "4"){ //allows a player to use Items like Potions, magic items, etc during battle
                await slowPrint(eventText,  "\nYou have no items to use!");
                isProcessing = false;
            }
            else if(choice == "5"){ //gives a player a chance to flee from the enemy
                let roll = Math.floor(Math.random() * 100);
                if (roll < fleeChance + 1){
                    await slowPrint(eventText,  "\n You flee from battle.");
                    await combatEnd(userInput, true);
                    return;
                }
                else{
                    await enemyMove(1);
                }
                isProcessing = false;
            }
            else {
                isProcessing = false;
            }
        }
    };
    setHandler(processCombat);
}

async function useSkill(cost, effect, quantity){
    if (stamina < cost){
        eventText.textContent = "Not enough stamina!";
        setHandler(skillSelect);
        return Promise.resolve();
    }
    eventText.textContent = "";
    stamina = stamina - cost;
    if (effect === "double"){
        slowPrint(eventText, "You use a burst of energy and, catching the enemy off guard, strike twice!");
        await calculateAttack(2);
        if(enemyHP <= 0){
                    await slowPrint(eventText,  " You have defeated the " + enemyName + "!");
                    await combatEnd(userInput, false)
                }
                else{
                    await enemyMove(1);
                }
                isProcessing = false;
    }
    else if (effect === "defenseBoost"){
        slowPrint(eventText, "You focus and harden your defenses, reducing incoming damage for the next 3 turns!");
        playerDefMultiplier = 0.75;
    }
    else if (effect === "heal"){
        playerHP += quantity;
        if (playerHP > playerHPMax){
            playerHP = playerHPMax;
        }
        slowPrint(eventText,  "\nYou channel your energy into a healing spell and restore your HP to " + playerHP + "!");
    }
    else if (effect === "stealth"){
        eventText.textContent = "";
        slowPrint(eventText, "You blend into the shadows, making it easier to flee!");
        fleeChance += 20;
    }
    else if (effect === "damageBoost"){
        slowPrint(eventText, "You focus your energy into a powerful strike, increasing your damage for the duration of the battle!");
        playerDamageMultiplier = 1.5;
    }
    skillWorked = true;
    return Promise.resolve();
}

function calculateAttack(modifier = playerDamageMultiplier){
    let damage = (Math.floor(Math.random() * 12) + 6) * modifier;
    enemyHP = enemyHP - damage;
    eventText.textContent = "\nYou attack the " + enemyName + " for " + damage + " damage!";
}

function enemyMove(playerDefMultiplier){
    let damage = Math.round((Math.floor(Math.random() * enemyDamageRanges[enemyId]) + enemyDamageMin[enemyId]) * playerDefMultiplier);
    playerHP = playerHP - damage;
    slowPrint(eventText, "\nThe " + enemyName + " attacks you for " + damage + " damage!" + 
    "\n Enemy HP: " + enemyHP + "\n Your HP: " + playerHP);
}

async function combatEnd(userInput, fled){
    isProcessing = false;
    if (fled === false){
    if (!userInput) {
        userInput = document.getElementById("playerChoice");
    }
    if (enemyName === "Cavemite"){
        await calcRewards("Cavemite Carapace", 8)
        await calcRewards("Cavemite Flesh", 8)
        await calcRewards("Cavemite Eye", 6)
    }
    else if(enemyName === "Minion"){
        await calcRewards("Minion Meat", 7)
        await calcRewards("Heart of Void", 5)
        await calcRewards("Minion Armor", 2)
    }
    else if(enemyName === "Warden"){
        await calcRewards("Artifact", 10)
    }
}
    await slowPrint(eventText,  "\nThe cave is quiet once again, save for the faint dripping of water on the stone floor.");
    choices.textContent = "\n 1. Continue";
    userInput.addEventListener("keydown", function processContinue(event){
        if(event.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            if (choice == "1"){
                goDeeper();
                userInput.removeEventListener("keydown", processContinue);
            }
        }
    });
}

function calcRewards(reward, chanceThreshold){
    return new Promise((resolve) => {
        if (Math.floor(Math.random() * 10) <= chanceThreshold){
            eventText.textContent += "\nYou have obtained " + reward + "!";
            inventory.push(reward);
        }
        resolve();
    });
}

function brewPotion(ingredients){
    eventText.textContent = "";
    slowPrint(eventText, "You find a rocky alcove where you can place your small brewer's pot. You can brew a potion to restore HP or Stamina," +
    "but you need the right ingredients. \n What do you want to brew?");
    choices.textContent = "\n 1. Health Potion (Restores 30 HP, Uses: Cavemite Carapace, Cavemite Flesh, Cavemite Eye)" +
    "\n 2. Stamina Potion (Restores 30 Stamina, Uses: Minion Meat, Heart of Void, Cavemite Flesh) \n 3. Potion of Vitality" + 
    "(Restores 50 HP, Uses: Cavemite Flesh x2, Cavemite Carapace, Cavemite Eye, Heart of Void) \n" + 
    "4. Potion of Life (Sets HP Max to 150 and instantly restores HP to full, Uses: Minion Meat x3, Minion Armor, Heart of Void x3)" + 
    "\n 5. Potion of Endurance (Sets Stamina Max to 150 and instantly restores Stamina to full, Uses: Minion Meat x3, Minion Armor, Heart of Void x3) \n 6. Cancel";
    userInput.addEventListener("keydown", function processPotion(event){
        if(event.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            if (choice == "1"){
                checkPotion("Health Potion", ["Cavemite Carapace", "Cavemite Flesh", "Cavemite Eye"], ingredients, userInput);
                userInput.removeEventListener("keydown", processPotion);
            }
            else if (choice == "2"){
                checkPotion("Stamina Potion", ["Minion Meat", "Heart of Void", "Cavemite Flesh"], ingredients, userInput);
                userInput.removeEventListener("keydown", processPotion);
            }
            else if (choice == "3"){
                checkPotion("Potion of Vitality", ["Cavemite Flesh", "Cavemite Flesh", "Cavemite Carapace", "Cavemite Eye", "Heart of Void"], ingredients, userInput);
                userInput.removeEventListener("keydown", processPotion);
            }
            else if (choice == "4"){
                checkPotion("Potion of Life", ["Minion Meat", "Minion Meat", "Minion Meat", "Minion Armor", "Heart of Void", "Heart of Void", "Heart of Void"], ingredients, userInput);
                userInput.removeEventListener("keydown", processPotion);
            }
            else if (choice == "5"){
                checkPotion("Potion of Endurance", ["Minion Meat", "Minion Meat", "Minion Meat", "Minion Armor", "Heart of Void", "Heart of Void", "Heart of Void"], ingredients, userInput);
                userInput.removeEventListener("keydown", processPotion);
            }
            else if (choice == "6"){
                noEncounter();
                userInput.removeEventListener("keydown", processPotion);
            }
            else{
                userInput.removeEventListener("keydown", processPotion);
                brewPotion(ingredients);
            }
        }
        });
    }

function checkPotion(typeName, ingredientsNeeded, ingredients, userInput){
    let hasIngredients = [false, false, false]
    let success = [true, true, true]
    for (let i = 0; i < ingredients.length; i++){ //fix later by making backwards
        for (let check = 0; check < ingredientsNeeded.length; check++){
            if (ingredients[i] === ingredientsNeeded[check]){
                if (hasIngredients[check] === true){
                    continue;
                }
                ingredients.splice(i, 1);
                i = i - 1
                hasIngredients[check] = true;
            }
        }
    }
    inventory = ingredients;
    if (checkHasIngredients(hasIngredients, success)){
        slowPrint(eventText,  "\nYou brew a " + typeName + "!");
                    if (typeName === "Health Potion"){
                        playerHP += 30;
                        if (playerHP > playerHPMax){
                            playerHP = playerHPMax;
                        }
                        slowPrint(eventText,  "\nYou drink the Health Potion and restore your HP to " + playerHP + "!");
                    }
                    else if (typeName === "Stamina Potion"){
                        stamina += 30;
                        if (stamina > staminaMax){
                            stamina = staminaMax;
                        }
                        slowPrint(eventText,  "\nYou drink the Stamina Potion and restore your Stamina to " + stamina + "!");
                    }
                    else if (typeName === "Potion of Vitality"){
                        playerHP += 50;
                        if (playerHP > playerHPMax){
                            playerHP = playerHPMax;
                        }
                        slowPrint(eventText,  "\nYou drink the Potion of Vitality and restore your HP to " + playerHP + "!");
                    }
                    else if (typeName === "Potion of Life"){
                        playerHPMax = 150;
                        playerHP = playerHPMax;
                        slowPrint(eventText,  "\nYou drink the Potion of Life and increase your max HP to 150 and restore your HP to full!");
                    }
                    else if (typeName === "Potion of Endurance"){
                        staminaMax = 150;
                        stamina = staminaMax;
                        slowPrint(eventText,  "\nYou drink the Potion of Endurance and increase your max Stamina to 150 and restore your Stamina to full!");
                    }
                }
    else{
        slowPrint(eventText,  "\nYou don't have the right ingredients to brew a " + typeName + "!");
    }
    choices.textContent = "\n 1. Back to Potions Menu \n2. Continue";
    userInput.addEventListener("keydown", function processContinue(event){
        if(event.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            userInput.removeEventListener("keydown", processContinue);
            if (choice == "1"){
                brewPotion(inventory);
            }
            else if (choice == "2"){
                goDeeper();
            }
            else{
                checkPotion(typeName, ingredientsNeeded, ingredients, userInput)
            }
        }
    });
}


function checkHasIngredients(real, success){
    for(let item = 0; item < real.length; item++){
        if (real[item] !== success[item]){
            return false;
        }
}
return true;
}

function runEncounter(){
    if (combatEncounters >= 40){
        eventText.textContent = "";
        slowPrint(eventText, "As you venture deeper into the cave, you feel an ominous presence looming over you. Suddenly, a towering figure emerges from the shadows - the Guardian of the Artifact! \n Player HP: " + playerHP);
        enemyId = 2;
    }
    else{
    const encounter = Math.floor(Math.random() * 10) + 1;
        if (encounter <= encounterDifficulty){
            enemyId = 1;
        }
        else{
            enemyId = 0;
        }
    combatInit();
    }
}

function goDeeper(){
    document.getElementById("caveImage").src = "image/CaveInside.png";
    switchbg = Math.floor(Math.random() * 10) + 1;
    if (switchbg <= 3){
        document.getElementById("caveImage").src = "image/CrystalCave.webp";
    }
    const newEvent = Math.floor(Math.random() * 10) + 1;
    if (newEvent <= 6){
        runEncounter();
    }
    else{
        noEncounter();
    }
}
function noEncounter(){
        eventText.textContent = "";
        slowPrint(eventText, "You continue down the dark, damp path into the cave. \nHP: " + playerHP +
        "\nStamina: " + stamina + "\n What do you do?")
        choices.textContent = "\n1. Go Deeper Into Cave \n2. Brew Potion \n3. Open Inventory \n4. Use Item";
        userInput.addEventListener("keydown", function processInput(event){
        if(event.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            if (choice == "1"){
                goDeeper();
                userInput.removeEventListener("keydown", processInput);
            }
            else if (choice == "2"){
                brewPotion(inventory);
                userInput.removeEventListener("keydown", processInput);
            }
            else if (choice == "3"){
                eventText.textContent = "";
                userInput.removeEventListener("keydown", processInput);
                inventoryDisplay = "Inventory: \n";
                const allItems = ["Cavemite Carapace", "Cavemite Flesh", "Cavemite Eye", "Minion Meat", "Heart of Void", "Minion Armor", "Artifact"];
                for (let i = 0; i < allItems.length; i++){
                    let count = 0;
                    for (let j = 0; j < inventory.length; j++){
                        if (inventory[j] === allItems[i]){
                            count++;
                        }
                    }
                    if (count > 0){
                        inventoryDisplay += allItems[i] + ": " + count + "\n ";
                    }
                }
                slowPrint(eventText, inventoryDisplay);
                choices.textContent = "\n1. Close Inventory";
                userInput.addEventListener("keydown", function closeInventory(event){
                    if(event.key === "Enter"){
                        let choice = userInput.value;
                        userInput.value = "";
                        if (choice == "1"){
                            noEncounter();
                            userInput.removeEventListener("keydown", closeInventory);
                        }
                    }
                });
            }
    }      
});
}


function init(){
    eventText.textContent = "";
    choices.textContent = "";
    slowPrint(eventText, "You are standing at the entrance of the cave. You hear faint groaning and creaks coming from inside." +
    " \nYou clutch the tattered Retrieval Contract in your hand - you must retrieve the Artifact from within, lest the land fall to decay.\n What do you do?")
    choices.textContent = "\n1. Enter Cave"
    userInput.addEventListener("keydown", function processInput(event){
        if(event.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            if (choice == "1"){
                goDeeper();
                userInput.removeEventListener("keydown", processInput);
            }
        }
    });
}

init();