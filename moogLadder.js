
// This file is unlicensed and uncopyright as found at:
// http://www.musicdsp.org/showone.php?id=24
// ported to js by tristan whitehill 2024

class moogLadder extends AudioWorkletProcessor {


    constructor(options) {
        super(options)
        this.stage = new Array(4).fill(0);
        this.stageZ1 = new Array(4).fill(0);




    }



    static get parameterDescriptors() {
        return [
            {
                name: "amplitude",
                defaultValue: 0.3,
                minValue: 0,
                maxValue: 1,
                automationRate: "k-rate",
              },
            {
                name: "frequency",
                defaultValue: 100,
                minValue: 30,
                maxValue: 10000.0,
                automationRate: "k-rate",

            },
            {
                name: "resonance",
                defaultValue: .5,
                minValue: 0,
                maxValue: .9,
                automationRate: "k-rate",


            },
            {
                name: "sr",
                defaultValue: 44100,
                minValue: 44100,
                maxValue: 48000
            }
        ];
    }
    SNAP_TO_ZERO(n) {
        if (!(n < -1.0e-8 || n > 1.0e-8)) n = 0;
        return n;
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];




        let input = inputs[0];


        let c = 2.0 * parameters.frequency / parameters.sr;
        let p = c * (1.8 - (0.8 * c));
        let k = 2.0 * Math.sin(c * Math.PI * 0.5) - 1.0;
        let t1 = (1.0 - p) * 1.386249;
        let t2 = 12.0 + t1 * t1;
        let r = parameters.resonance * (t2 + 6.0 * t1) / (t2 - 6.0 * t1);
      

 

        for (let channel = 0; channel < input.length; ++channel) {
            for (let sample = 0; sample < input[channel].length; ++sample) {

                 this.x = input[channel][sample] - r * this.stage[3];
                this.stage[0] = this.x *  p + this.stageZ1[0] *  p -  k * this.stage[0];

                this.stage[1] = this.stage[0] *  p + this.stageZ1[1] *  p -  k * this.stage[1];
                this.stage[2] = this.stage[1] *  p + this.stageZ1[2] *  p -  k * this.stage[2];
                this.stage[3] = this.stage[2] *  p + this.stageZ1[3] *  p -  k * this.stage[3];

                this.stage[3] -= (this.stage[3] * this.stage[3] * this.stage[3]) / 6.0;

                this.stageZ1[0] = this.x;
                this.stageZ1[1] = this.stage[0];
                this.stageZ1[2] = this.stage[1];
                this.stageZ1[3] = this.stage[2];



                let out = this.SNAP_TO_ZERO(this.stage[3])
                output[channel][sample] = out* parameters.amplitude;

            }

        }

        return true;
    }
}

registerProcessor("moogladder", moogLadder);





