// --- CONFIGURATION & CLASSES ---
class GPU {
    constructor(id, name, hash, tdp, cost) {
        this.id = id; this.name = name; this.hash = hash; 
        this.tdp = tdp; this.cost = cost; this.count = 0;
    }
}

class GameEngine {
    constructor() {
        this.coins = 0;
        this.marketPrice = 1.25;
        this.psuCapacity = 600;
        this.temp = 32;
        this.isCrashed = false;
        
        this.hardware = [
            new GPU('rx580', 'RX 580', 25, 185, 50),
            new GPU('rtx3060', 'RTX 3060', 60, 170, 280),
            new GPU('rtx4090', 'RTX 4090', 180, 450, 1200),
            new GPU('h100', 'NVIDIA H100', 900, 700, 8500)
        ];

        this.init();
    }

    init() {
        setTimeout(() => {
            document.getElementById('boot-screen').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            this.renderShop();
            this.startLoops();
            this.log("KERNEL LOADED. HARDWARE SCAN COMPLETE.");
        }, 1500);

        document.getElementById('manual-mine').addEventListener('click', () => this.pulse());
    }

    pulse() {
        if (this.isCrashed) return;
        this.coins += 0.1;
        this.temp += 0.5;
        this.updateUI();
    }

    buyGPU(id) {
        const gpu = this.hardware.find(g => g.id === id);
        if (this.coins >= gpu.cost) {
            this.coins -= gpu.cost;
            gpu.count++;
            this.log(`PROCURED: ${gpu.name} INSTALLED IN SLOT ${gpu.count}`);
            this.updateUI();
        }
    }

    log(msg) {
        const stream = document.getElementById('log-stream');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerText = `> ${msg}`;
        stream.prepend(entry);
    }

    updateUI() {
        let totalDraw = 0;
        let totalHash = 0;

        this.hardware.forEach(gpu => {
            totalDraw += (gpu.count * gpu.tdp);
            totalHash += (gpu.count * gpu.hash);
            const btn = document.getElementById(`buy-${gpu.id}`);
            if (btn) btn.disabled = this.coins < gpu.cost;
        });

        // Power Check
        if (totalDraw > this.psuCapacity) this.triggerCrash("PSU_FAILURE: OVERCURRENT");

        // Thermal Check
        if (this.temp > 95) totalHash *= 0.1; // Thermal Throttling

        document.getElementById('coins').innerText = this.coins.toFixed(6);
        document.getElementById('pwr-val').innerText = totalDraw;
        document.getElementById('pwr-bar').style.width = Math.min((totalDraw / this.psuCapacity) * 100, 100) + "%";
        document.getElementById('temp-val').innerText = Math.round(this.temp);
        document.getElementById('temp-bar').style.width = Math.min(this.temp, 100) + "%";
    }

    triggerCrash(reason) {
        this.isCrashed = true;
        document.body.classList.add('glitch-active');
        this.log(`CRITICAL_ERROR: ${reason}`);
        setTimeout(() => location.reload(), 3000);
    }

    renderShop() {
        const container = document.getElementById('gpu-shop');
        this.hardware.forEach(gpu => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <span>${gpu.name} ($${gpu.cost})</span>
                <button id="buy-${gpu.id}" onclick="game.buyGPU('${gpu.id}')">BUY</button>
            `;
            container.appendChild(div);
        });
    }

    startLoops() {
        // Passive Income & Cooling
        setInterval(() => {
            if (this.isCrashed) return;
            
            let currentHash = 0;
            this.hardware.forEach(g => currentHash += g.count * g.hash);
            
            this.coins += (currentHash * 0.0001);
            if (this.temp > 30) this.temp -= 0.5; // Natural dissipation
            
            this.updateUI();
        }, 1000);

        // Market Fluctuation
        setInterval(() => {
            this.marketPrice += (Math.random() - 0.5) * 0.1;
            document.getElementById('market-price').innerText = this.marketPrice.toFixed(2);
        }, 5000);
    }
}

const game = new GameEngine();
