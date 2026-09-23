// Constantes e Prêmios Padrão
const DEFAULT_PRIZES = [
  { id: '1', name: 'Air Fryer', color: '#e63946', weight: 1, removeOnWin: false, icon: '🍟' },
  { id: '2', name: 'Ventilador Turbo', color: '#1d3557', weight: 1, removeOnWin: false, icon: '💨' },
  { id: '3', name: 'Liquidificador', color: '#457b9d', weight: 1, removeOnWin: false, icon: '🍹' },
  { id: '4', name: 'Vale-Compras', color: '#2a9d8f', weight: 1, removeOnWin: false, icon: '🛒' },
  { id: '5', name: 'Vale-Combustível', color: '#e76f51', weight: 1, removeOnWin: false, icon: '⛽' },
  { id: '6', name: 'Kit Churrasco', color: '#f4a261', weight: 1, removeOnWin: false, icon: '🥩' },
  { id: '7', name: 'Pix Premiado', color: '#10b981', weight: 1, removeOnWin: false, icon: '💸' },
  { id: '8', name: 'Jogo de Panelas', color: '#8b5cf6', weight: 1, removeOnWin: false, icon: '🍳' },
];

class SoundController {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580 + Math.random() * 80, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio tick error:', e);
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major chord
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, this.audioCtx.currentTime + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.9);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.95);
      });
    } catch (e) {
      console.warn('Fanfare audio error:', e);
    }
  }
}

class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(duration = 4500) {
    this.resize();
    const colors = ['#fb9138', '#00873e', '#ffd700', '#00e5ff', '#ff3b30', '#ffffff', '#ffb703'];
    const count = 190;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width * (0.2 + Math.random() * 0.6),
        y: this.canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.7) * 22,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop(Date.now() + duration);
    }
  }

  loop(endTime) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // Gravidade
      p.vx *= 0.98; // Atrito ar
      p.rotation += p.rotationSpeed;
      p.tilt += p.tiltSpeed;

      if (Date.now() > endTime - 1000) {
        p.opacity -= 0.02;
      }

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * Math.cos(p.tilt));
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop(endTime));
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

class RouletteApp {
  constructor() {
    this.prizes = this.loadPrizes();
    this.history = this.loadHistory();
    this.autoRemove = localStorage.getItem('roleta_auto_remove') === 'true';
    this.roomCode = this.getOrInitRoomCode();
    this.mqttClient = null;

    this.currentRotation = 0; // em radianos
    this.isSpinning = false;
    this.lastTickIndex = -1;

    this.sound = new SoundController();
    this.confetti = new ConfettiEngine(document.getElementById('confetti-canvas'));

    this.initDOM();
    this.createLights();
    this.renderWheel();
    this.updatePrizesPreview();
    this.renderHistory();
    this.bindEvents();
    this.initRemoteSync();
  }

  loadPrizes() {
    const saved = localStorage.getItem('roleta_feirao_prizes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Falha ao ler prêmios:', e);
      }
    }
    return [...DEFAULT_PRIZES];
  }

  savePrizes() {
    localStorage.setItem('roleta_feirao_prizes', JSON.stringify(this.prizes));
  }

  loadHistory() {
    const saved = localStorage.getItem('roleta_feirao_history');
    return saved ? JSON.parse(saved) : [];
  }

  saveHistory() {
    localStorage.setItem('roleta_feirao_history', JSON.stringify(this.history));
  }

  getOrInitRoomCode() {
    let code = localStorage.getItem('roleta_room_code');
    if (!code) {
      code = 'IDEALIZE-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('roleta_room_code', code);
    }
    return code;
  }

  openQrModal() {
    const qrModal = document.getElementById('qr-modal');
    if (!qrModal) return;
    qrModal.classList.add('active');
    this.renderQrCode();
  }

  closeQrModal() {
    const qrModal = document.getElementById('qr-modal');
    if (qrModal) qrModal.classList.remove('active');
  }

  renderQrCode() {
    let baseUrl = window.location.href.split('index.html')[0].split('#')[0].split('?')[0];
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    const remoteUrl = `${baseUrl}remote.html?room=${this.roomCode}`;

    const qrContainer = document.getElementById('qrcode-container');
    const roomCodeDisplay = document.getElementById('qr-room-code');
    const directLinkInput = document.getElementById('qr-direct-link');

    if (roomCodeDisplay) roomCodeDisplay.textContent = this.roomCode;
    if (directLinkInput) directLinkInput.value = remoteUrl;

    if (qrContainer) {
      qrContainer.innerHTML = '';
      let generated = false;
      if (typeof QRCode !== 'undefined') {
        try {
          new QRCode(qrContainer, {
            text: remoteUrl,
            width: 180,
            height: 180,
            colorDark: '#002e15',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
          generated = true;
        } catch (err) {
          console.warn('QRCode JS error:', err);
        }
      }

      if (!generated || qrContainer.children.length === 0) {
        const encodedUrl = encodeURIComponent(remoteUrl);
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}&color=002e15" alt="QR Code" width="180" height="180" style="display:block;margin:0 auto;border-radius:10px;">`;
      }
    }
  }

  initRemoteSync() {
    this.renderQrCode();

    if (typeof Paho !== 'undefined') {
      this.connectMQTT();
    }
  }

  connectMQTT() {
    const topic = `idealize/roleta/${this.roomCode}`;
    const clientId = `tv_${this.roomCode}_${Math.random().toString(16).substr(2, 6)}`;
    
    try {
      this.mqttClient = new Paho.MQTT.Client('broker.emqx.io', 8084, '/mqtt', clientId);

      this.mqttClient.onConnectionLost = (responseObject) => {
        setTimeout(() => this.connectMQTT(), 3000);
      };

      this.mqttClient.onMessageArrived = (message) => {
        try {
          const data = JSON.parse(message.payloadString);
          if (data.action === 'phone_connected') {
            const statusTag = document.getElementById('qr-status-tag');
            if (statusTag) {
              statusTag.textContent = '🟢 Celular Conectado!';
              statusTag.classList.add('connected');
            }
          } else if (data.action === 'spin_request') {
            if (data.clientName) {
              this.clientInput.value = data.clientName;
            }
            const qrModal = document.getElementById('qr-modal');
            if (qrModal && qrModal.open) qrModal.close();

            this.spin();
          }
        } catch (e) {
          console.error('MQTT error:', e);
        }
      };

      this.mqttClient.connect({
        useSSL: true,
        timeout: 5,
        onSuccess: () => {
          this.mqttClient.subscribe(topic);
        },
        onFailure: (err) => {
          setTimeout(() => this.connectMQTT(), 4000);
        }
      });
    } catch (e) {
      console.warn('Falha Paho MQTT:', e);
    }
  }

  publishRemote(data) {
    try {
      if (this.mqttClient && this.mqttClient.isConnected()) {
        const topic = `idealize/roleta/${this.roomCode}`;
        const msg = new Paho.MQTT.Message(JSON.stringify(data));
        msg.destinationName = topic;
        this.mqttClient.send(msg);
      }
    } catch (e) {
      console.warn('Erro ao publicar:', e);
    }
  }

  initDOM() {
    this.canvas = document.getElementById('wheel-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.pointer = document.querySelector('.wheel-pointer');
    this.lightsRing = document.getElementById('lights-ring');

    this.btnSpinCenter = document.getElementById('btn-spin-center');
    this.btnSpinAction = document.getElementById('btn-spin-action');
    this.clientInput = document.getElementById('client-name');

    this.winnerModal = document.getElementById('winner-modal');
    this.settingsModal = document.getElementById('settings-modal');
  }

  createLights() {
    const totalLights = 24;
    this.lightsRing.innerHTML = '';
    const radius = 50; // porcentagem

    for (let i = 0; i < totalLights; i++) {
      const angle = (i / totalLights) * 2 * Math.PI;
      const x = 50 + 48.5 * Math.cos(angle);
      const y = 50 + 48.5 * Math.sin(angle);

      const bulb = document.createElement('div');
      bulb.className = 'light-bulb';
      bulb.style.left = `${x}%`;
      bulb.style.top = `${y}%`;
      this.lightsRing.appendChild(bulb);
    }
  }

  toggleLightsAnimation(active) {
    const bulbs = this.lightsRing.querySelectorAll('.light-bulb');
    if (active) {
      this.lightsInterval = setInterval(() => {
        bulbs.forEach((bulb, idx) => {
          if (Math.random() > 0.4) {
            bulb.classList.toggle('active-glow');
          }
        });
      }, 90);
    } else {
      clearInterval(this.lightsInterval);
      bulbs.forEach(b => b.classList.remove('active-glow'));
    }
  }

  bindEvents() {
    // Girar
    this.btnSpinCenter.addEventListener('click', () => this.spin());
    this.btnSpinAction.addEventListener('click', () => this.spin());

    // Enter no input do cliente dispara o giro
    this.clientInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.spin();
    });

    // Som
    const btnSound = document.getElementById('btn-sound-toggle');
    const soundStatus = document.getElementById('sound-status');
    btnSound.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      soundStatus.textContent = this.sound.enabled ? 'Som Ligado' : 'Som Mudo';
      btnSound.style.opacity = this.sound.enabled ? '1' : '0.6';
    });

    // Tela Cheia
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          alert(`Erro ao tentar tela cheia: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Modais
    document.getElementById('btn-open-settings').addEventListener('click', () => this.openSettings());
    document.getElementById('btn-quick-manage').addEventListener('click', () => this.openSettings());
    document.getElementById('btn-close-settings').addEventListener('click', () => this.settingsModal.close());
    document.getElementById('btn-close-winner').addEventListener('click', () => this.winnerModal.close());

    // Presets de Título do Evento
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('event-title').innerText = btn.dataset.title;
        document.getElementById('event-subtitle').innerText = btn.dataset.sub;
      });
    });

    // Configurações - Adicionar Prêmio
    document.getElementById('btn-add-prize').addEventListener('click', () => {
      const colors = ['#e63946', '#2a9d8f', '#e76f51', '#f4a261', '#3a86ff', '#8338ec', '#ff006e'];
      this.prizes.push({
        id: Date.now().toString(),
        name: 'Novo Prêmio',
        color: colors[this.prizes.length % colors.length],
        weight: 1,
        removeOnWin: false,
        icon: '🎁'
      });
      this.renderPrizesTable();
    });

    // Restaurar Padrões
    document.getElementById('btn-reset-default-prizes').addEventListener('click', () => {
      if (confirm('Deseja restaurar a lista padrão de prêmios do Feirão?')) {
        this.prizes = JSON.parse(JSON.stringify(DEFAULT_PRIZES));
        this.renderPrizesTable();
      }
    });

    // Salvar Configurações
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      this.readPrizesFromTable();
      this.autoRemove = document.getElementById('setting-auto-remove').checked;
      localStorage.setItem('roleta_auto_remove', this.autoRemove);
      this.savePrizes();
      this.renderWheel();
      this.updatePrizesPreview();
      this.settingsModal.close();
    });

    // Limpar Histórico
    document.getElementById('btn-clear-history').addEventListener('click', () => {
      if (confirm('Deseja limpar todo o histórico de sorteados?')) {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
      }
    });

    // Exportar CSV
    document.getElementById('btn-export-history').addEventListener('click', () => {
      this.exportHistoryCSV();
    });

    // Modal de QR Code / Controle Mobile
    const btnOpenQr = document.getElementById('btn-open-qr');
    const qrModal = document.getElementById('qr-modal');
    const btnCloseQr = document.getElementById('btn-close-qr');
    const btnCopyQr = document.getElementById('btn-copy-qr-link');

    if (btnOpenQr && qrModal) {
      btnOpenQr.addEventListener('click', () => {
        qrModal.showModal();
      });
    }

    if (btnCloseQr && qrModal) {
      btnCloseQr.addEventListener('click', () => {
        qrModal.close();
      });
    }

    if (btnCopyQr) {
      btnCopyQr.addEventListener('click', () => {
        const input = document.getElementById('qr-direct-link');
        input.select();
        navigator.clipboard.writeText(input.value);
        btnCopyQr.textContent = 'Copiado! ✅';
        setTimeout(() => {
          btnCopyQr.textContent = 'Copiar Link';
        }, 2000);
      });
    }
  }

  renderWheel() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    this.ctx.clearRect(0, 0, width, height);

    if (this.prizes.length === 0) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px Montserrat';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Adicione prêmios para girar!', centerX, centerY);
      return;
    }

    const totalSlices = this.prizes.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.currentRotation);

    // Desenhar fatias
    for (let i = 0; i < totalSlices; i++) {
      const prize = this.prizes[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();

      // Gradiente suave na fatia
      const grad = this.ctx.createRadialGradient(0, 0, 40, 0, 0, radius);
      grad.addColorStop(0, prize.color);
      grad.addColorStop(1, this.adjustBrightness(prize.color, -25));
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Borda divisória entre fatias
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      // Ponto decorativo na extremidade da fatia
      const pinX = (radius - 14) * Math.cos(startAngle);
      const pinY = (radius - 14) * Math.sin(startAngle);
      this.ctx.beginPath();
      this.ctx.arc(pinX, pinY, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Texto do Prêmio
      this.ctx.save();
      this.ctx.rotate(startAngle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.font = 'bold 22px Outfit, Montserrat, sans-serif';

      // Truncar texto se for muito longo
      let label = prize.name;
      if (label.length > 18) label = label.slice(0, 16) + '...';

      this.ctx.fillText(label, radius - 35, 0);

      this.ctx.restore();
    }

    this.ctx.restore();
  }

  adjustBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  spin() {
    if (this.isSpinning) return;
    if (this.prizes.length === 0) {
      alert('Por favor, adicione prêmios nas configurações!');
      return;
    }

    this.sound.init();
    this.isSpinning = true;
    this.btnSpinCenter.disabled = true;
    this.btnSpinAction.disabled = true;
    this.toggleLightsAnimation(true);

    this.publishRemote({
      action: 'spinning',
      clientName: this.clientInput.value.trim() || 'Cliente VIP'
    });

    // Calcular vencedor com base nos pesos
    const totalWeight = this.prizes.reduce((sum, p) => sum + (Number(p.weight) || 1), 0);
    let randomNum = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < this.prizes.length; i++) {
      randomNum -= (Number(this.prizes[i].weight) || 1);
      if (randomNum <= 0) {
        winningIndex = i;
        break;
      }
    }

    const totalSlices = this.prizes.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    // O ponteiro fica no topo (3 * PI / 2 radianos, ou 270 graus).
    // Para a fatia `winningIndex` parar no ponteiro, o centro dela precisa estar alinhado com o topo.
    const pointerAngle = 1.5 * Math.PI;
    const sliceCenterAngle = winningIndex * sliceAngle + sliceAngle / 2;

    // Rotações completas extras (entre 6 e 10 voltas para emoção máxima)
    const extraSpins = (Math.floor(Math.random() * 4) + 6) * 2 * Math.PI;

    // Ângulo final
    const targetRotation = this.currentRotation + extraSpins + (pointerAngle - (this.currentRotation % (2 * Math.PI)) - sliceCenterAngle);

    // Duração do giro
    const spinDuration = 5500 + Math.random() * 1000; // ~6 segundos
    const startTime = performance.now();
    const initialRotation = this.currentRotation;

    const animateSpin = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Curva de desaceleração suave (Ease-out Quint)
      const easeOut = 1 - Math.pow(1 - progress, 4.5);
      this.currentRotation = initialRotation + (targetRotation - initialRotation) * easeOut;

      // Calcular qual fatia está passando pelo ponteiro para tocar o som de 'tique'
      const normalizedRot = (this.currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const angleUnderPointer = (pointerAngle - normalizedRot + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIndex = Math.floor(angleUnderPointer / sliceAngle) % totalSlices;

      if (currentSliceIndex !== this.lastTickIndex) {
        this.sound.playTick();
        this.lastTickIndex = currentSliceIndex;

        // Feedback tátil no ponteiro
        this.pointer.classList.add('kick');
        setTimeout(() => this.pointer.classList.remove('kick'), 50);
      }

      this.renderWheel();

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.onSpinComplete(this.prizes[winningIndex]);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  onSpinComplete(winningPrize) {
    this.isSpinning = false;
    this.btnSpinCenter.disabled = false;
    this.btnSpinAction.disabled = false;
    this.toggleLightsAnimation(false);

    // Efeitos de Celebração
    this.sound.playFanfare();
    this.confetti.fire(5000);

    const clientName = this.clientInput.value.trim() || 'Cliente VIP';

    // Gravar no histórico
    const record = {
      id: Date.now(),
      client: clientName,
      prize: winningPrize.name,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('pt-BR'),
    };
    this.history.unshift(record);
    this.saveHistory();
    this.renderHistory();

    // Exibir Modal de Vencedor
    document.getElementById('winner-client-display').textContent = clientName;
    document.getElementById('winner-prize-name').textContent = winningPrize.name;
    this.winnerModal.showModal();

    // Notificar controle no celular
    this.publishRemote({
      action: 'winner',
      prize: winningPrize.name,
      clientName: clientName
    });

    // Se configurado para remover prêmio após vitória
    if (this.autoRemove || winningPrize.removeOnWin) {
      this.prizes = this.prizes.filter(p => p.id !== winningPrize.id);
      this.savePrizes();
      this.updatePrizesPreview();
      setTimeout(() => this.renderWheel(), 1500);
    }
  }

  updatePrizesPreview() {
    const list = document.getElementById('prizes-list-preview');
    const countBadge = document.getElementById('prizes-count');
    countBadge.textContent = this.prizes.length;
    list.innerHTML = '';

    this.prizes.forEach(p => {
      const li = document.createElement('li');
      li.className = 'prize-pill-item';
      li.innerHTML = `
        <span class="prize-color-dot" style="background-color: ${p.color};"></span>
        <span style="flex:1;">${p.name}</span>
        <span style="font-size:0.75rem; color:#ffd700; font-weight:700;">x${p.weight}</span>
      `;
      list.appendChild(li);
    });
  }

  renderHistory() {
    const list = document.getElementById('history-list');
    const emptyMsg = document.getElementById('history-empty');
    const exportBtn = document.getElementById('btn-export-history');

    list.innerHTML = '';

    if (this.history.length === 0) {
      emptyMsg.style.display = 'block';
      exportBtn.style.display = 'none';
      return;
    }

    emptyMsg.style.display = 'none';
    exportBtn.style.display = 'block';

    this.history.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = `
        <div class="history-top">
          <span class="history-client">${item.client}</span>
          <span class="history-time">${item.timestamp}</span>
        </div>
        <div class="history-prize">🎁 ${item.prize}</div>
      `;
      list.appendChild(li);
    });
  }

  exportHistoryCSV() {
    if (this.history.length === 0) return;
    let csv = 'Data,Hora,Contemplado,Premio\n';
    this.history.forEach(item => {
      csv += `"${item.date}","${item.timestamp}","${item.client}","${item.prize}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ganhadores_feirao_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  openSettings() {
    this.renderPrizesTable();
    document.getElementById('setting-auto-remove').checked = this.autoRemove;
    this.settingsModal.showModal();
  }

  renderPrizesTable() {
    const tbody = document.getElementById('prizes-table-body');
    tbody.innerHTML = '';

    this.prizes.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="color" class="table-color" value="${p.color}"></td>
        <td><input type="text" class="table-name" value="${p.name}"></td>
        <td><input type="number" class="table-weight" value="${p.weight || 1}" min="1" max="100"></td>
        <td style="text-align:center;"><input type="checkbox" class="table-remove" ${p.removeOnWin ? 'checked' : ''}></td>
        <td>
          <button class="btn-table-remove" data-index="${idx}">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-table-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        this.prizes.splice(index, 1);
        this.renderPrizesTable();
      });
    });
  }

  readPrizesFromTable() {
    const rows = document.querySelectorAll('#prizes-table-body tr');
    const newPrizes = [];

    rows.forEach((row, idx) => {
      const color = row.querySelector('.table-color').value;
      const name = row.querySelector('.table-name').value.trim() || `Prêmio ${idx + 1}`;
      const weight = parseInt(row.querySelector('.table-weight').value, 10) || 1;
      const removeOnWin = row.querySelector('.table-remove').checked;

      newPrizes.push({
        id: this.prizes[idx] ? this.prizes[idx].id : Date.now().toString() + idx,
        name,
        color,
        weight,
        removeOnWin,
        icon: '🎁'
      });
    });

    this.prizes = newPrizes;
  }
}

// Funções Globais para o Modal de QR Code
window.openQrModal = function() {
  if (window.rouletteApp) {
    window.rouletteApp.openQrModal();
  } else {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.classList.add('active');
  }
};

window.closeQrModal = function() {
  if (window.rouletteApp) {
    window.rouletteApp.closeQrModal();
  } else {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.classList.remove('active');
  }
};

window.copyQrLink = function() {
  const input = document.getElementById('qr-direct-link');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value);
    const btn = document.getElementById('btn-copy-qr-link');
    if (btn) {
      btn.textContent = 'Copiado! ✅';
      setTimeout(() => btn.textContent = 'Copiar Link', 2000);
    }
  }
};

// Inicializar quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  window.rouletteApp = new RouletteApp();
});
