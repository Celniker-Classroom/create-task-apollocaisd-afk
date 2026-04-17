//CITATIONS:
//Image "Cave Entrance" from StockCake https://stockcake.com/i/mysterious-cave-entrance_3619879_1718494
//Image "Inside Cave" from Shutterstock: https://www.shutterstock.com/image-vector/dark-pixel-art-cave-entrance-moss-2689681071
//Image "Crystal Cave" from Shutterstock: https://www.shutterstock.com/search/cave-pixel

let textNarration = document.getElementById("textNarration");
let fleeChance = 70
let playerHPMax = 100
let playerHP = playerHPMax
let staminaMax = 100
let stamina = staminaMax
let inventory = []

let enemyHPs = [40, 100, 180]
let enemyNames = ["Goblin", "Orc", "Troll"]
let enemyfleeChances = [50, 30, 40]
let enemyDamageRanges = [5, 9, 15]
let enemyDamageMin = [1, 4, 6];
let enemy_id = 0
let enemyHP = 0;
let enemyName = 0;
function combatInit(){
    enemyHP = enemyHPs[enemy_id];
    enemyName = enemyNames[enemy_id];
    fleeChance = enemyfleeChances[enemy_id];
    eventText.textContent = "You have encountered a " + enemyName + "! \n Enemy HP: " + enemyHP;
    choices.textContent = "\n1. Attack \n2. Defend \n3. Skills \n4. Use Item \n5. Flee (" + fleeChance + "%)";
    combatLoop()
    enemy_id = enemy_id + 1;
}

function combatLoop(){
    let userInput = document.getElementById("playerChoice");
    userInput.addEventListener("keydown", function(processInput){
        if(processInput.key === "Enter"){
            let choice = userInput.value;
            userInput.value = "";
            eventText.textContent = "In Combat: " + enemyName;
            if(choice == "1"){
                calculateAttack();
                if(enemyHP <= 0){
                    eventText.textContent += "You have defeated the " + enemyName + "!";
                    combatEnd()
                }
                else{
                    enemyMove(1);
                }
            }
            else if(choice == "2"){
                eventText.textContent += "\nYou raise your shield to block the next blow. You regain some stamina.";
                stamina += Math.floor(Math.random()* 10);
                if (stamina > staminaMax){
                    stamina = staminaMax;
                }
                enemyMove(0.5)
            }
            else if(choice == "3"){

            }
            else if(choice == "4"){

            }
            else if(choice == "5"){
                roll = Math.floor(Math.random() * 100)
                if (roll < fleeChance + 1){
                    eventText.textContent += "\n You flee from battle.";
                    combatEnd()
                }
                else{
                    enemyMove(1);
                }
            }
        }
    });
}

function calculateAttack(){
    let damage = Math.floor(Math.random() * 10) + 5;
    enemyHP = enemyHP - damage;
    eventText.textContent += "\nYou attack the " + enemyName + " for " + damage + " damage!";
    return;
}

function enemyMove(playerDefMultiplier){
    let damage = Math.round((Math.floor(Math.random() * enemyDamageRanges[enemy_id]) + enemyDamageMin[enemy_id]) * playerDefMultiplier);
    playerHP = playerHP - damage;
    eventText.textContent += "\nThe " + enemyName + " attacks you for " + damage + " damage!";
    eventText.textContent += "\n Enemy HP: " + enemyHP;
    return;
}

function combatEnd(){
    if (enemyName = "Cavemite"){
        calcRewards("Cavemite Carapace", 8)
        calcRewards("Cavemite Flesh", 8)
    }
    else if(enemyName = "Minion"){
        calcRewards("Minion Meat", 6)
        calcRewards()
    }
}

function calcRewards(reward, chanceThreshold){
    if (Math.floor(Math.random * 10) <= chanceThreshold){
            inventory.push(reward);
        }
}

function init(){
    eventText.textContent = "You are standing at the entrance of the cave. You hear faint groaning and creaks coming from inside." +
    " \nYou clutch the tattered Retrieval Contract in your hand - you must retrieve the Artifact from within, lest the kingdom fall to usurpers.\n What do you do?"
    choices.textContent = "\n1. Enter Cave"
}

combatInit();