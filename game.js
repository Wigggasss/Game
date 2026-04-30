let coins = 0;
let psuCapacity = 500;
let gpuCount = 1;
let baseTDP = 185; 
let temp = 35;
let ocLevel = 0;
let coolingActive = false;

const logBox = document.getElementById('system-log');

function log(msg, cls = "") {
    let div = document.createElement('div');
    div.className = "log-entry " + cls;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logBox.prepend(div);
    if (logBox.childNodes.length > 8) logBox.removeChild(logBox.lastChild);
}

function updateUI() {
    let ocMultiplier = 1 + (ocLevel / 100);
    let currentDraw = gpuCount * baseTDP * (1 + (ocLevel/150));
    let hashRate = (gpuCount * 25) * ocMultiplier;

    if (temp > 90) {
        hashRate *= 0.4;
        log("WARNING: Thermal throttling active!", "critical");
    }

    document.getElementById('coins').innerText = coins.toFixed(4);
    document.getElementById('hashrate').innerText = hashRate.toFixed(1);
    document.getElementById('power-draw').innerText = Math.round(currentDraw);
    document.getElementById('psu-cap').innerText = psuCapacity;
    document.getElementById('temp-reading').innerText = Math.round(temp);
    document.getElementById('oc-val').innerText = ocLevel;
    document.getElementById('risk-val').innerText = (ocLevel > 20) ? (ocLevel - 20) * 2 : 0;

    let pwrPercent = (currentDraw / psuCapacity) * 100;
    let pwrFill = document.getElementById('power-fill');
    pwrFill.style.width = Math.min(pwrPercent, 100) + "%";
    pwrFill.className = pwrPercent > 90 ? "fill critical-fill" : (pwrPercent > 75 ? "fill warning-fill" : "fill");

    let tempPercent = ((temp - 30) / 70) * 100;
    let tempFill = document.getElementById('temp-fill');
    tempFill.style.width = Math.min(tempPercent, 100) + "%";
    tempFill.className = temp > 85 ? "fill critical-fill" : (temp > 70 ? "fill warning-fill" : "fill");

    if (currentDraw > psuCapacity) {
        alert("BLACK SCREEN: PSU Overload! System shut down.");
        location.reload();
    }

    if (ocLevel > 25 && Math.random() < ((ocLevel - 25) / 500)) {
        createArtifact();
        if (Math.random() < 0.05) {
            alert("CRITICAL: Driver Timeout! Overclock too high.");
            location.reload();
        }
    }

    document.getElementById('buy-gpu-btn').disabled = coins < 50;
    document.getElementById('buy-psu-btn').disabled = coins < 120;
    document.getElementById('buy-cool-btn').disabled = (coins < 300 || coolingActive);
}

function mine() {
    coins += 0.5;
    temp += (coolingActive ? 0.1 : 0.4);
    updateUI();
}

function buyGPU() {
    if (coins >= 50) {
        coins -= 50;
        gpuCount++;
        log(`Added GPU #${gpuCount}: RX 580 online.`);
        updateUI();
    }
}

function buyPSU() {
    if (coins >= 120) {
        coins -= 120;
        psuCapacity += 400;
        log(`New PSU Installed: ${psuCapacity}W limit.`);
        updateUI();
    }
}

function installCooling() {
    if (coins >= 300) {
        coins -= 300;
        coolingActive = true;
        log(`Liquid Cooling Loop initialized.`);
        updateUI();
    }
}

function createArtifact() {
    const overlay = document.getElementById('artifact-overlay');
    const art = document.createElement('div');
    art.className = 'artifact';
    art.style.left = Math.random() * 100 + "vw";
    art.style.top = Math.random() * 100 + "vh";
    overlay.appendChild(art);
    setTimeout(() => art.remove(), 200);
}

document.getElementById('oc-slider').addEventListener('input', (e) => {
    ocLevel = parseInt(e.target.value);
    updateUI();
});

setInterval(() => {
    let coolRate = coolingActive ? 1.5 : 0.5;
    if (temp > 35) temp -= coolRate;
    coins += (gpuCount * 0.02 * (1 + (ocLevel / 100)));
    updateUI();
}, 1000);

log("System online. Looking for hardware...");
updateUI();
