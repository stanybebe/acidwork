class doubleSaw extends AudioWorkletProcessor {


  constructor(options) {
    super(options)
    this.phase = 0;
    this.phaseb = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "amplitude",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1
      },
      {
        name: "frequency",
        defaultValue: 440,
        minValue: 27.5,
        maxValue: 4186.009,
        automationRate: "k-rate",

      },
      {
        name: "drift",
        defaultValue: 1,
        minValue: 0,
        maxValue: 5,
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

  onepole(inp, out, coeff) {


    return out += coeff * (inp - out);;
  }

  lerp(y0, y1, x) {//this version assumes integer x values
    let scalar = x - Math.floor(x);//how far away are we from y0?
    return (y0 * (1 - scalar)) + (y1 * (scalar));
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];




    let sampleRate = parameters.sr;
    let phaseInc = ((Math.PI * 2) * parameters.frequency) / sampleRate;

    let f = 0;
    let pf = 0;
    let currentSample = 0;
    for (let channel = 0; channel < output.length; ++channel) {
      for (let i = 0; i < output[channel].length; ++i) {
        currentSample = (this.phase + this.phaseb) * .1;

        if (this.phase >= 1.0) this.phase -= 2.0;
        if (this.phaseb >= 1.0) this.phaseb -= 2.0;

        
          
          this.phase += 1. / (sampleRate / parameters.frequency);
          this.phaseb += 1. / (sampleRate /(parameters.frequency*2)+parameters.drift);




        output[channel][i] = currentSample;
      }
    }
    return true;
  }
}

registerProcessor("doublesaw", doubleSaw);