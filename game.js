// --- CONFIGURATION & CLASSES ---
class GPU {
    constructor(id, name, hash, tdp, cost, description, heatSignature) {
        this.id = id;
        this.name = name;
        this.hash = hash;
        this.tdp = tdp;
        this.cost = cost;
        this.description = description;
        this.heatSignature = heatSignature;
        this.count = 0;
    }
}

class Upgrade {
    constructor(id, name, cost, description, applyEffect) {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.description = description;
        this.applyEffect = applyEffect;
        this.purchased = false;
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
            new GPU('rx580', 'GPU Tier 1: Radeon RX 580', 25, 185, 50,
                'A legendary entry-level card. Reliable for beginners, but draws high power for its output. Watch your thermals!', 1.2),
            new GPU('rtx3060', 'GPU Tier 2: GeForce RTX 3060', 60, 170, 280,
                'Modern efficiency. Features lower TDP and better hashrates. A solid mid-range choice for scaling your farm.', 1.0),
            new GPU('rtx4090', 'GPU Tier 3: GeForce RTX 4090', 180, 450, 1200,
                'The beast. Unmatched hashing power, but requires a massive PSU and advanced liquid cooling to stay stable.', 2.2)
        ];

        this.upgrades = [
            new Upgrade('psu1600', 'Infrastructure: 1600W Titanium PSU', 650,
                'Industry-grade power delivery. Essential for running multiple high-end cards without tripping the breaker.',
                () => { this.psuCapacity = 1600; this.log('[HARDWARE] 1600W PSU online. Power rails stabilized.'); }),
            new Upgrade('ac', 'Thermal Upgrade: Industrial AC Unit', 900,
                'Drops ambient temperature by 15°C. Allows for extreme overclocking without thermal throttling.',
                () => { this.temp = Math.max(20, this.temp - 15); this.log('[HARDWARE] Industrial AC engaged. Ambient temperature dropped.'); })
        ];

        this.init();
    }

    init() {
        setTimeout(() => {
            document.getElementById('boot-screen').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            this.renderShop();
            this.renderInfrastructure();
            this.startLoops();
            this.log('[SYSTEM] BIOS v2.0.4 loaded. Scanning PCI-E slots...');
        }, 1500);

        document.getElementById('manual-mine').addEventListener('click', () => this.pulse());
    }

    pulse() {
        if (this.isCrashed) return;
        this.coins += 0.1;
        this.temp += 0.8;
        this.updateUI();
    }

    buyGPU(id) {
        const gpu = this.hardware.find(g => g.id === id);
        if (!gpu || this.isCrashed) return;

        if (gpu.id === 'rtx4090' && this.psuCapacity < 1600) {
            this.triggerCrash('[ERROR] FATAL_SYSTEM_EXCEPTION: CLOCK_WATCHDOG_TIMEOUT. Please restart.');
            return;
        }

        if (this.coins >= gpu.cost) {
            this.coins -= gpu.cost;
            gpu.count++;
            this.log('[HARDWARE] New device detected. Initializing driver set... Stable.');
            this.updateUI();
        }
    }

    buyUpgrade(id) {
        const upgrade = this.upgrades.find(u => u.id === id);
        if (!upgrade || upgrade.purchased || this.isCrashed) return;

        if (this.coins >= upgrade.cost) {
            this.coins -= upgrade.cost;
            upgrade.purchased = true;
            upgrade.applyEffect();
            this.updateUI();
            this.renderInfrastructure();
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
            totalDraw += gpu.count * gpu.tdp;
            totalHash += gpu.count * gpu.hash;

            const btn = document.getElementById(`buy-${gpu.id}`);
            if (btn) btn.disabled = this.coins < gpu.cost || this.isCrashed;
        });

        this.upgrades.forEach(upgrade => {
            const btn = document.getElementById(`buy-${upgrade.id}`);
            if (btn) btn.disabled = this.coins < upgrade.cost || upgrade.purchased || this.isCrashed;
        });

        if (totalDraw > this.psuCapacity) {
            this.triggerCrash('[ERROR] FATAL_SYSTEM_EXCEPTION: CLOCK_WATCHDOG_TIMEOUT. Please restart.');
            return;
        }

        if (this.temp > 85 && this.temp <= 95) {
            this.log('[WARNING] GPU Core temperature > 85°C. Fans at 100%. Efficiency dropping.');
        }

        if (this.temp > 95) {
            totalHash *= 0.5;
            this.log('[CRITICAL] Thermal limit reached! Performance throttled by 50% to prevent hardware damage.');
        }

        if (this.temp > 102) {
            this.log('[ALERT] Memory bus instability detected. Visual artifacts may occur.');
        }

        document.getElementById('coins').innerText = this.coins.toFixed(6);
        document.getElementById('pwr-val').innerText = totalDraw;
        document.getElementById('pwr-bar').style.width = `${Math.min((totalDraw / this.psuCapacity) * 100, 100)}%`;
        document.getElementById('temp-val').innerText = Math.round(this.temp);
        document.getElementById('temp-bar').style.width = `${Math.min(this.temp, 100)}%`;

        if (this.coins >= 10000) {
            this.log('CONNECTION ESTABLISHED: GENESIS BLOCK SECURED. You are no longer a basement hobbyist—you are the Silicon Tycoon.');
        }
    }

    triggerCrash(reason) {
        if (this.isCrashed) return;
        this.isCrashed = true;
        document.body.classList.add('glitch-active');
        this.log(reason);
        setTimeout(() => location.reload(), 3000);
    }

    renderShop() {
        const container = document.getElementById('gpu-shop');
        container.innerHTML = '';

        this.hardware.forEach(gpu => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div>
                    <strong>${gpu.name}</strong><br>
                    <small>${gpu.description}</small><br>
                    <small>Heat Signature: ${gpu.heatSignature.toFixed(1)}x | ${gpu.hash} H/s | ${gpu.tdp}W</small>
                </div>
                <button id="buy-${gpu.id}" onclick="game.buyGPU('${gpu.id}')">BUY ($${gpu.cost})</button>
            `;
            container.appendChild(div);
        });
    }

    renderInfrastructure() {
        const container = document.getElementById('infra-shop');
        container.innerHTML = '';

        this.upgrades.forEach(upgrade => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div>
                    <strong>${upgrade.name}</strong><br>
                    <small>${upgrade.description}</small>
                </div>
                <button id="buy-${upgrade.id}" onclick="game.buyUpgrade('${upgrade.id}')">${upgrade.purchased ? 'OWNED' : `BUY ($${upgrade.cost})`}</button>
            `;
            container.appendChild(div);
        });
    }

    startLoops() {
        setInterval(() => {
            if (this.isCrashed) return;

            let currentHash = 0;
            let heatLoad = 0;
            this.hardware.forEach(g => {
                currentHash += g.count * g.hash;
                heatLoad += g.count * g.heatSignature;
            });

            this.coins += currentHash * 0.0001;
            this.temp += heatLoad * 0.05;
            if (this.temp > 30) this.temp -= 0.5;

            this.updateUI();
        }, 1000);

        setInterval(() => {
            this.marketPrice += (Math.random() - 0.5) * 0.1;
            document.getElementById('market-price').innerText = this.marketPrice.toFixed(2);
        }, 5000);
    }
}

const game = new GameEngine();
