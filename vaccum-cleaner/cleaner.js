// MIT License
// Copyright (c) 2020 Luis Espino

function reflex_agent(location, state) {
    if (state == "DIRTY") return "CLEAN";
    else if (location < states.length - 1) return "RIGHT";
    else return "LEFT";
}

function test(states, visited) {
    var location = states[0];		
    var state = states[location + 1]; // Estado de la ubicación actual
    var action_result = reflex_agent(location, state);

    document.getElementById("log").innerHTML += "<br>Location: " + location + " | Action: " + action_result;

    if (action_result == "CLEAN") {
        states[location + 1] = "CLEAN"; // Limpiar la ubicación
        visited[location] = true; // Marcar la ubicación como visitada y limpia
    } else if (action_result == "RIGHT") {
        states[0] = location + 1; // Mover a la derecha
    } else if (action_result == "LEFT" && location > 0) {
        states[0] = location - 1; // Mover a la izquierda
    }

    // Ensuciar aleatoriamente algunas ubicaciones
    if (Math.random() < 0.3) states[1] = "DIRTY"; 
    if (Math.random() < 0.3) states[2] = "DIRTY"; 
    if (Math.random() < 0.3) states[3] = "DIRTY"; 
    if (Math.random() < 0.3) states[4] = "DIRTY"; 

    // Verificar si todas las ubicaciones han sido limpiadas al menos una vez
    if (visited.every(v => v)) {
        document.getElementById("log").innerHTML += "<br>All locations have been cleaned at least once!";
        return;
    }

    setTimeout(function(){ test(states, visited); }, 2000);
}

// Inicialización de ubicaciones y estados
var states = [0, "DIRTY", "DIRTY", "DIRTY", "DIRTY"];
var visited = new Array(states.length - 1).fill(false); // Control de estados limpiados

test(states, visited);
