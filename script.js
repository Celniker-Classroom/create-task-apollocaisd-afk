let textNarration = document.getElementById("textNarration");
let fleeChance = 70
let playerHP = 100

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
            eventText.textContent = "In Combat: " + enemyName + "\n Enemy HP: " + enemyHP;
            if(choice == "1"){
                calculateAttack();
                if(enemyHP <= 0){
                    eventText.textContent += "You have defeated the " + enemyName + "!";
                }
                else{
                    enemyMove();
                }
            }
        }
    });
}

function calculateAttack(){
    let damage = Math.floor(Math.random() * 10) + 5;
    enemyHP = enemyHP - damage;
    eventText.textContent += "You attack the " + enemyName + " for " + damage + " damage! \n Enemy HP: " + enemyHP;
    return;
}

function enemyMove(){
    let damage = Math.floor(Math.random() * enemyDamageRanges[enemy_id]) + enemyDamageMin[enemy_id];
    playerHP = playerHP - damage;
    eventText.textContent += "The " + enemyName + " attacks you for " + damage + " damage! \n Your HP: " + playerHP;
    return;
}

function init(){
    eventText.textContent = "You are standing at the entrance of the castle. You hear the faint marching of castle guards inside." +
    " The red Ethorian banner waves in the spring wind."
    choices.textContent = "\n1. Travel \n2. Enter Castle \n3. Rest \n4. Use Item"
}

combatInit();