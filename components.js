
class stepUnit {
    constructor(x, y, w, h) {
        this.tog = createToggle("", x, y, w, h);
        this.sldA = createSlider("", x, y + (h / 2), w*2, h/2);
        this.sldB = createSlider("", x, y + (h * 2), w*2, h/2);
        
        // <color name="Persian orange" hex="CD947A" r="205" g="148" b="122" />
        // <color name="Chinese Violet" hex="71587E" r="113" g="88" b="126" />
        // <color name="Timberwolf" hex="E0DDD6" r="224" g="221" b="214" />
        // <color name="Hunyadi yellow" hex="F0B650" r="240" g="182" b="80" />
        // <color name="Keppel" hex="67B5A0" r="103" g="181" b="160" />
    }
    getTog() {
        return this.tog.val;
    }
    getSlideA() {
        return this.sldA.val;
    }
    getSlideB() {
        return this.sldB.val;
    }
}






class drumVoice {
    constructor(type, freq, modType, modAmt, attack, decay) {
        this.osc = new p5.Oscillator('sine');
        this.type = type;
        this.freq = freq;
        this.modType = modType;
        this.modAmt = modAmt;
        this.attack = attack;
        this.decay = decay;
        this.modulator = new p5.Oscillator('sine');
        this.env = new p5.Envelope(this.attack, this.modAmt, this.decay, this.modAmt);
        this.penv = new p5.Envelope(this.attack, this.modAmt, this.decay, this.modAmt);
        this.n = new p5.Noise('white');
        this.delay = new p5.Delay();
        this.hp = new p5.HighPass();
        this.bf = 200;
        this.mf = 100;
        this.bfreq;
        this.mfreq;
        this.r = .8;
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
                this.osc.amp(.7);
                this.env.setADSR(0.000, 0., this.decay, 0.1);
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
                this.osc.amp(.7);
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
                this.osc.amp(.06);

                this.osc.disconnect();
                this.n.disconnect();
                this.modulator.disconnect();

                this.env.setADSR(0.006, 0.02, this.decay, 0.193);
                this.penv.setADSR(this.attack, 0.4, this.decay, 0.8);
                this.modulator.freq(this.modAmt);
                this.modulator.amp(.06);
                this.penv.scale(this.modAmt);
                this.osc.freq(this.modulator);
                this.modulator.connect(this.hp);
                this.osc.connect(this.hp);

                this.n.connect(this.hp);

                this.hp.freq(7000);

                this.env.play(this.modulator);
                this.env.play(this.hp);
                this.env.play(this.osc);

                this.delay.process(this.hp, .005, .28, 9000);

                this.env.mult(.2);;

                this.delay.disconnect();




                this.gain.setInput(this.delay, this.env);
                this.gain.connect();
                this.gain.amp(.02)



                break;
            case 3:
                this.env.setADSR(0.01, 0.1, 0.02, 0.12);

                actx.audioWorklet.addModule("moogLadder.js")
                    .then(() => {
                        this.workletNodeMoog = new AudioWorkletNode(actx, 'moogladder');

                        console.log(this.workletNodeMoog)
                        this.mfreq = this.workletNodeMoog.parameters.get("frequency");
                        this.r = this.workletNodeMoog.parameters.get("resonance");
                        this.mfreq.setValueAtTime(this.mf, actx.currentTime);
                        this.r.setValueAtTime(.5, actx.currentTime);

                        actx.audioWorklet.addModule("doubleSaw.js")
                            .then(() => {
                                this.workletNodeSaw = new AudioWorkletNode(actx, 'doublesaw');
                                this.workletNodeSaw.disconnect();
                                this.workletNodeSaw.connect(this.workletNodeMoog);
                                // this.workletNodeMoog.disconnect();
                                this.workletNodeMoog.connect(this.hp);
                                this.hp.freq(20);
                                this.env.play(this.hp);
                                console.log(this.workletNodeSaw)
                                this.bfreq = this.workletNodeSaw.parameters.get("frequency");
                                this.drift = this.workletNodeSaw.parameters.get("drift");
                                this.amp = this.workletNodeSaw.parameters.get("amplitude");
                                this.bfreq.setValueAtTime(this.bf, actx.currentTime);
                                this.drift.setValueAtTime(5, actx.currentTime);

                            })
                            .catch(err => {
                                console.error('Failed to load AudioWorklet module:', err);
                            });

                    })
                    .catch(err => {
                        console.error('Failed to load AudioWorklet module:', err);
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
        this.mf = f;
        this.mfreq = this.workletNodeMoog.parameters.get("frequency");
        this.r = this.workletNodeMoog.parameters.get("resonance");
        this.mfreq.exponentialRampToValueAtTime(f, actx.currentTime + t);
        this.r.setValueAtTime(.5, actx.currentTime);

    }


}