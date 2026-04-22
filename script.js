//CITATIONS:
//Image "Cave Entrance" from StockCake https://stockcake.com/i/mysterious-cave-entrance_3619879_1718494
//Image "Inside Cave" from Shutterstock: https://www.shutterstock.com/image-vector/dark-pixel-art-cave-entrance-moss-2689681071
//Image "Crystal Cave" from Shutterstock: https://www.shutterstock.com/search/cave-pixel

let textNarration = document.getElementById("textNarration");
let encounterDifficulty = 0
let fleeChance = 70
let playerHPMax = 100
let playerHP = playerHPMax
let staminaMax = 100
let stamina = staminaMax
let inventory = []
let usables = []
let combatActive = false;

let enemyHPs = [40, 80, 200]
let enemyNames = ["Cavemite", "Minion", "Warden"]
let enemyfleeChances = [50, 40, 30]
let enemyDamageRanges = [5, 9, 15]
let enemyDamageMin = [1, 4, 6];
let enemyId = 0
let enemyHP = 0;
let enemyName = 0;
function combatInit(){
    enemyHP = enemyHPs[enemyId];
    enemyName = enemyNames[enemyId];
    fleeChance = enemyfleeChances[enemyId];
    combatLoop();
}

//GOTTA BUGFIX COMBATLOOP
function combatLoop(){
    eventText.textContent = "You have encountered a " + enemyName + "! \n Player HP: " + playerHP + "\n Enemy HP: " + enemyHP;
    choices.textContent = "\n1. Attack \n2. Defend \n3. Skills \n4. Use Item \n5. Flee (" + fleeChance + "%)";
    let userInput = document.getElementById("playerChoice");
    userInput.addEventListener("keydown", processCombat);
        function processCombat(event){
        if(event.key === "Enter"){
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
            if(choice == "1"){
                calculateAttack();
                if(enemyHP <= 0){
                    eventText.textContent += " You have defeated the " + enemyName + "!";
                    userInput.removeEventListener("keydown", processCombat);
                    combatEnd(userInput, false)
                }
                else{
                    enemyMove(1);
                }
            }
            else if(choice == "2"){
                staminaRegained = Math.floor(Math.random()* 10);
                eventText.textContent += "\nYou raise your shield to block the next blow. You regain" + staminaRegained + " stamina.";
                stamina += staminaRegained;
                if (stamina > staminaMax){
                    stamina = staminaMax;
                }
                enemyMove(0.5)
            }
            else if(choice == "3"){
                eventText.textContent += "\nSkills Menu: \n Stamina: " + stamina;
                choices.textContent = "\n1. DOUBLESTRIKE SKILL \n2. DEFENSE SKILL \n3. HEALING SKILL \n4. STEALTH SKILL \n5. DAMAGE BOOST SKILL \n6. Cancel";
                userInput.removeEventListener("keydown", processCombat);
                userInput.addEventListener("keydown", function skillSelect(key){
                    if (key.key === "Enter"){
                        let skillChoice = userInput.value;
                        userInput.value = "";
                        if (skillChoice === "1"){
                            useSkill(15, "double", 30)
                            eventText.textContent += "BAH";
                            userInput.removeEventListener("keydown", skillSelect);
                            combatLoop()
                        }
                    }
                })
            }
            else if(choice == "4"){
                eventText.textContent += "\nYou have no items to use!";
            }
            else if(choice == "5"){
                roll = Math.floor(Math.random() * 100)
                if (roll < fleeChance + 1){
                    eventText.textContent += "\n You flee from battle.";
                    userInput.removeEventListener("keydown", processCombat);
                    combatEnd(userInput, true);
                }
                else{
                    enemyMove(1);
                }
            }
        }
    };
}

function useSkill(cost, effect, quantity){
    if (stamina < cost){
        eventText.textContent = "YOU DONT HAVE ENOUGH SP YOU IDIOT YOU STUPID ADVENTURER HOW COULD YOU NOT HAVE ENOUGH SP I HATE EVERYTHING ABOUT YOU I LITERALLY HATE YOU AND EVERYTHING YOU STAND FOR AAAHHH";
        return;
    }
    stamina = stamina - cost;
    if (effect = "double"){
        eventText.textContent = "double :)" + quantity;
    }
}

function calculateAttack(){
    let damage = Math.floor(Math.random() * 10) + 5;
    enemyHP = enemyHP - damage;
    eventText.textContent += "\nYou attack the " + enemyName + " for " + damage + " damage!";
    return;
}

function enemyMove(playerDefMultiplier){
    let damage = Math.round((Math.floor(Math.random() * enemyDamageRanges[enemyId]) + enemyDamageMin[enemyId]) * playerDefMultiplier);
    playerHP = playerHP - damage;
    eventText.textContent += "\nThe " + enemyName + " attacks you for " + damage + " damage!";
    eventText.textContent += "\n Enemy HP: " + enemyHP;
    eventText.textContent += "\n Your HP: " + playerHP;
    return;
}

function combatEnd(userInput, fled){
    if (fled === false){
    if (!userInput) {
        userInput = document.getElementById("playerChoice");
    }
    if (enemyName === "Cavemite"){
        calcRewards("Cavemite Carapace", 8)
        calcRewards("Cavemite Flesh", 8)
        calcRewards("Cavemite Eye", 6)
    }
    else if(enemyName === "Minion"){
        calcRewards("Minion Meat", 7)
        calcRewards("Heart of Void", 5)
        calcRewards("Minion Armor", 2)
    }
    else if(enemyName === "Warden"){
        calcRewards("Artifact", 10)
    }
}
    eventText.textContent += "\nThe cave is quiet once again, save for the faint dripping of water on the stone floor.";
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
    if (Math.floor(Math.random() * 10) <= chanceThreshold){
            eventText.textContent += "\nYou have obtained " + reward + "!";
            inventory.push(reward);
        }
    }

function brewPotion(ingredients){
    eventText.textContent = "You find a rocky alcove where you can place your small brewer's pot. You can brew a potion to restore HP or Stamina, but you need the right ingredients. \n What do you want to brew?"
    choices.textContent = "\n 1. Health Potion (Restores 30 HP, Uses: Cavemite Carapace, Cavemite Flesh, Cavemite Eye)" +
    "\n 2. Stamina Potion (Restores 30 Stamina, Uses: Minion Meat, Heart of Void, Cavemite Flesh) \n 3. Cancel";
    let userInput = document.getElementById("playerChoice");
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
                goDeeper();
                userInput.removeEventListener("keydown", processPotion);
            }
        }
        });
    }

function checkPotion(typeName, ingredientsNeeded, ingredients, userInput){
    let hasIngredients = [false, false, false]
    let success = [true, true, true]
    for (let i = 0; i < ingredients.length; i++){ //fix later by making backwards
        for (let check = 0; check < 3; check++){
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
        eventText.textContent += "\nYou brew a " + typeName + "!";
                    if (typeName === "Health Potion"){
                        playerHP += 30;
                        if (playerHP > playerHPMax){
                            playerHP = playerHPMax;
                        }
                        eventText.textContent += "\nYou drink the Health Potion and restore your HP to " + playerHP + "!";
                    }
                    else if (typeName === "Stamina Potion"){
                        stamina += 30;
                        if (stamina > staminaMax){
                            stamina = staminaMax;
                        }
                        eventText.textContent += "\nYou drink the Stamina Potion and restore your Stamina to " + stamina + "!";
                    }
                }
    else{
        eventText.textContent += "\nYou don't have the right ingredients to brew a " + typeName + "!";
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
    const encounter = Math.floor(Math.random() * 10) + 1;
        if (encounter <= encounterDifficulty+5){
            enemyId = 1;
        }
        else{
            enemyId = 0;
        }
    combatInit();
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
        eventText.textContent = "You continue down the dark, damp path into the cave. HP: " + playerHP +
        "\n What do you do?"
        choices.textContent = "\n1. Go Deeper Into Cave \n2. Brew Potion \n3. Rest \n4. Use Item"
        let userInput = document.getElementById("playerChoice");
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
        }
    });
}
}

function init(){
    eventText.textContent = "You are standing at the entrance of the cave. You hear faint groaning and creaks coming from inside." +
    " \nYou clutch the tattered Retrieval Contract in your hand - you must retrieve the Artifact from within, lest the kingdom fall to usurpers.\n What do you do?"
    choices.textContent = "\n1. Enter Cave"
    let userInput = document.getElementById("playerChoice");
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