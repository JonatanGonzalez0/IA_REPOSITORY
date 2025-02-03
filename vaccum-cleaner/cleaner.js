// MIT License
// Copyright (c) 2020 Luis Espino

function reflex_agent(location, state) {
    if (state == "DIRTY") return "CLEAN";
    else if (location == "A") return "RIGHT";
    else if (location == "B") return "LEFT";
}

function test(states, visitedStates) {
    var location = states[0];		
    var state = location == "A" ? states[1] : states[2];
    var action_result = reflex_agent(location, state);

    document.getElementById("log").innerHTML += "<br>Location: " + location + " | Action: " + action_result;

    if (action_result == "CLEAN") {
        if (location == "A") states[1] = "CLEAN";
        else if (location == "B") states[2] = "CLEAN";
    } else if (action_result == "RIGHT") {
        states[0] = "B";
    } else if (action_result == "LEFT") {
        states[0] = "A";
    }

    // Simular ensuciamiento aleatorio para explorar más estados
    if (Math.random() < 0.3) states[1] = "DIRTY";
    if (Math.random() < 0.3) states[2] = "DIRTY";

    // Guardar el estado actual en el Set
    let stateKey = `${states[0]},${states[1]},${states[2]}`;
    visitedStates.add(stateKey);

    // Verificar si se han visitado los 8 estados posibles
    if (visitedStates.size >= 8) {
        document.getElementById("log").innerHTML += "<br>✅ All 8 states have been visited! ✅";
        return;
    }

    setTimeout(function(){ test(states, visitedStates); }, 300);
}

// Inicialización
var states = ["A", "DIRTY", "DIRTY"];
var visitedStates = new Set();

test(states, visitedStates);
