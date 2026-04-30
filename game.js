let coins = 0;
let psuCapacity = 500;
let gpuCount = 1;
let baseTDP = 185; // RX 580 wattage
let temp = 35;

function updateUI() {
    let currentDraw = gpuCount * baseTDP;
    let hashRate = gpuCount * 25; // 25 MH/s per card
    
    // Throttling Logic
    if (temp > 90) hashRate *= 0.5;

    document.getElementById('coins').innerText = coins.toFixed(4);
    document.getElementById('hashrate').innerText = hashRate;
    document.getElementById('power-draw').innerText = currentDraw;
    
    let pwrPercent = (currentDraw / psuCapacity) * 100;
    document.getElementById('power-fill').style.width = Math.min(pwrPercent, 100) + "%";
    
    // Check for Crash
    if (currentDraw > psuCapacity) {
        log("CRITICAL: POWER OVERLOAD. SYSTEM REBOOTING...", "critical");
        location.reload(); 
    }
}

function mine() {
    coins += 0.5;
    temp += 0.5;
    updateUI();
}

function buyGPU(type) {
    if (coins >= 50) {
        coins -= 50;
        gpuCount++;
        log(`GPU added: ${type} online.`);
        updateUI();
    }
}

function log(msg, cls = "") {
    let div = document.createElement('div');
    div.className = "log-entry " + cls;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    let logBox = document.getElementById('system-log');
    logBox.prepend(div);
}

// Passive cooling & Auto-income
setInterval(() => {
    if (temp > 30) temp -= 0.2; // Ambient cooling
    coins += (gpuCount * 0.01);
    updateUI();
}, 1000);
