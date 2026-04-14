let textNarration = document.getElementById("textNarration");
let fleeChance = 70
let playerHP = 100

let enemyHPs = [1, "hello", 124]
function combat(){
    let userInput = document.getElementById("playerChoice");
    let enemyHP = enemyHPs[0]
    textNarration.textContent = "You have encountered a " + "[enemy]!\n1. Attack \n2. Defend \n3. Skills \n4. Use Item \n5. Flee (" + fleeChance + "%)";
}

function init(){
    textNarration.textContent = "You are standing at the entrance of the castle. You hear the faint marching of castle guards inside." +
    " The red Ethorian banner waves in the spring wind.\n1. Travel \n2. Enter Castle \n3. Rest \n4. Use Item"
}

combat();