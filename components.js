class slidey {
  constructor(x_pos, y_pos, w, h, val) {
    this.xpos = 0;
    this.ypos = 0;
    this.width = 0;
    this.height = 0;
    this.value = 0;
    this.map = 0;
    this.omax = 0;
    this.omin = 0;
    this.s = 0;
    this.c1 = 10;
    this.xpos = x_pos;
    this.ypos = y_pos;
    this.width = w;
    this.height = h;
    this.value = val;
  }

  draw(ca, cb, cc) {
    this.c1--;

    push();
    noStroke();

    for (let i = 0; i < this.width; i++) {
      fill(cc);
      rect(this.xpos + i + 2, this.ypos + 2, 1, this.height);

      fill(ca);
      rect(this.xpos + i, this.ypos, 1, this.height);
      let p = floor(map(this.value, 0, 1, 0, this.width));
      if (p <= i) {
        fill(cb);
        rect(this.xpos + i, this.ypos, 1, this.height);
      }
    }

    if (mouseIsPressed) {
      if (
        mouseX > this.xpos &&
        mouseX < this.xpos + this.width &&
        mouseY > this.ypos &&
        mouseY < this.ypos + this.height
      ) {
        if (this.c1 < 0) {
          let clampX = constrain(
            mouseX,
            this.xpos - 10,
            this.xpos + this.width + 10
          );
          let valmap = map(clampX, this.xpos, this.xpos + this.width, 0, 1);
          this.value = valmap;
          this.c1 = 10;
        }
      }
    }

    pop();
  }

  getValue(omin_, omax_, s_) {
    this.omax = omax_;
    this.omin = omin_;
    this.s = s_;

    switch (this.s) {
      case 0:
        this.map = map(this.value, 0, 1, this.omin, this.omax);
        break;
      case 1:
        this.map = floor(map(this.value, 0, 1, this.omin, this.omax));
        break;
    }
    return this.map;
  }
}
class tog {
  constructor(xp, yp, size_) {
    this.c1 = 10;
    this.value = false;
    this.valueB = false;
    this.dist = 0;
    this.xPos = 0;
    this.base = 0;
    this.size = 0;
    this.radiusM = 0;
    this.radiusP = 0;
    this.size = size_;
    this.radiusM = this.size - this.size / 8;
    this.radiusP = this.size;
    this.xPos = xp;
    this.base = yp;
  }

  draw(ca, cb, cc) {
    this.c1--;

    push();

    noStroke();

    this.dist = dist(this.xPos, this.base, mouseX, mouseY);

    if (mouseIsPressed) {
      if (this.dist <= this.radiusP && this.c1 < 0) {
        this.value = !this.value;
        this.c1 = 10;
      }
    }

    if (this.value) {
      fill(cc);
      ellipse(this.xPos + 2, this.base + 2, this.radiusP * 2);
      fill(cb);
      ellipse(this.xPos, this.base, this.radiusP * 2);
      fill(ca);
      ellipse(this.xPos, this.base, this.radiusM * 2);
    } else {
      fill(cc);
      ellipse(this.xPos + 2, this.base + 2, this.radiusP * 2);
      fill(cb);
      ellipse(this.xPos, this.base, this.radiusP * 2);
    }
    pop();
  }
}
class stepUnit {
  constructor(x, y, w, h) {
    this.togg = new tog(x, y, (w / 8)*7, h);
    this.sldA = new slidey(x - w /1.5, y + h / 2, w*1.5, h / 3, 0);
    this.sldB = new slidey(x - w /1.5, y + h, w*1.5, h / 3, 0);

    // <color name="Persian orange" hex="CD947A" r="205" g="148" b="122" />
    // <color name="Chinese Violet" hex="71587E" r="113" g="88" b="126" />
    // <color name="Timberwolf" hex="E0DDD6" r="224" g="221" b="214" />
    // <color name="Hunyadi yellow" hex="F0B650" r="240" g="182" b="80" />
    // <color name="Keppel" hex="67B5A0" r="103" g="181" b="160" />
    this.cola;
  }
  draw(ca, cb, cc) {
    this.cola = cc;
    this.togg.draw(ca, cb, this.cola);
    this.sldA.draw(ca, cb, this.cola);
    this.sldB.draw(ca, cb, this.cola);
  }
  setCol(c){
    this.cola = c;
  }
  getTog() {
    return this.togg.value;
  }
  getSlideA() {
    return this.sldA.value;
  }
  getSlideB() {
    return this.sldB.value;
  }
}

class drumVoice {
  constructor(type, freq, modType, modAmt, attack, decay) {
    this.osc = new p5.Oscillator("sine");
    this.type = type;
    this.freq = freq;
    this.modType = modType;
    this.modAmt = modAmt;
    this.attack = attack;
    this.decay = decay;
    this.modulator = new p5.Oscillator("sine");
    this.env = new p5.Envelope(
      this.attack,
      this.modAmt,
      this.decay,
      this.modAmt
    );
    this.penv = new p5.Envelope(
      this.attack,
      this.modAmt,
      this.decay,
      this.modAmt
    );
    this.n = new p5.Noise("white");
    this.delay = new p5.Delay();
    this.hp = new p5.HighPass();
    this.bf = 200;
    this.mf = 100;
    this.bfreq;
    this.mfreq;
    this.r = 0.8;
    this.drift;
    this.amp;
    this.workletNodeSaw;
    this.workletNodeMoog;
    this.gain = new p5.Gain();
    this.gain.disconnect();
  }

  initVoice(actx) {
    switch (this.modType) {
      case 0:
        this.osc.start();
        this.osc.type = this.type;
        this.osc.amp(0.7);
        this.env.setADSR(0.0, 0, this.decay, 0.1);
        this.penv.setADSR(this.attack, 0.4, this.decay, 0.1);
        this.modulator.amp(this.modAmt);
        this.penv.scale(this.modAmt);
        this.osc.freq(this.penv);
        this.env.play(this.osc);
        break;
      case 1:
        this.osc.start();
        this.n.start();
        this.osc.type = this.type;
        this.osc.amp(0.7);
        this.env.setADSR(0.0, 0.02, this.decay, 0.0093);
        this.penv.setADSR(this.attack, 0.4, this.decay, 0.1);
        this.modulator.amp(this.modAmt);
        this.penv.scale(this.modAmt);
        this.osc.freq(this.penv);
        this.env.play(this.n);
        this.env.play(this.osc);
        break;
      case 2:
        this.osc.start();
        this.n.start();
        this.modulator.start();
        this.osc.type = this.type;
        this.osc.amp(0.06);

        this.osc.disconnect();
        this.n.disconnect();
        this.modulator.disconnect();

        this.env.setADSR(0.006, 0.02, this.decay, 0.193);
        this.penv.setADSR(this.attack, 0.4, this.decay, 0.8);
        this.modulator.freq(this.modAmt);
        this.modulator.amp(0.06);
        this.penv.scale(this.modAmt);
        this.osc.freq(this.modulator);
        this.modulator.connect(this.hp);
        this.osc.connect(this.hp);

        this.n.connect(this.hp);

        this.hp.freq(7000);

        this.env.play(this.modulator);
        this.env.play(this.hp);
        this.env.play(this.osc);

        this.delay.process(this.hp, 0.005, 0.28, 9000);

        this.env.mult(0.2);

        this.delay.disconnect();

        this.gain.setInput(this.delay, this.env);
        this.gain.connect();
        this.gain.amp(0.02);

        break;
      case 3:
        this.env.setADSR(0.01, 0.1, 0.02, 0.12);

        actx.audioWorklet
          .addModule("moogLadder.js")
          .then(() => {
            this.workletNodeMoog = new AudioWorkletNode(actx, "moogladder");

            console.log(this.workletNodeMoog);
            this.mfreq = this.workletNodeMoog.parameters.get("frequency");
            this.r = this.workletNodeMoog.parameters.get("resonance");
            this.mfreq.setValueAtTime(this.mf, actx.currentTime);
            this.r.setValueAtTime(0.5, actx.currentTime);
          })
          .catch((err) => {
            console.error("Failed to load AudioWorklet module:", err);
          });

        actx.audioWorklet
          .addModule("doubleSaw.js")
          .then(() => {
            this.workletNodeSaw = new AudioWorkletNode(actx, "doublesaw");
            this.workletNodeSaw.disconnect();
            this.workletNodeSaw.connect(this.workletNodeMoog);
            // this.workletNodeMoog.disconnect();
            this.workletNodeMoog.connect(this.hp);
            this.hp.freq(20);
            this.env.play(this.hp);
            console.log(this.workletNodeSaw);
            this.bfreq = this.workletNodeSaw.parameters.get("frequency");
            this.drift = this.workletNodeSaw.parameters.get("drift");
            this.amp = this.workletNodeSaw.parameters.get("amplitude");
            this.bfreq.setValueAtTime(this.bf, actx.currentTime);
            this.drift.setValueAtTime(5, actx.currentTime);
          })
          .catch((err) => {
            console.error("Failed to load AudioWorklet module:", err);
          });

        break;
    }
  }

  trig() {
    this.env.play();
    this.penv.play();
  }

  pitchy(f, t) {
    this.bfreq = this.workletNodeSaw.parameters.get("frequency");
    this.bf = f;
    this.bfreq.exponentialRampToValueAtTime(f, actx.currentTime + t);
  }

  filty(f, t) {
    if (this.workletNodeMoog) {
      this.mf = f;
      this.mfreq = this.workletNodeMoog.parameters.get("frequency");
      this.r = this.workletNodeMoog.parameters.get("resonance");
      this.mfreq.exponentialRampToValueAtTime(f, actx.currentTime + t);
      this.r.setValueAtTime(0.5, actx.currentTime);
    }
  }
}
