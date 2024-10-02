
//  * This source code is provided without any warranties as published in 
//  * DAFX book 2nd edition, copyright Wiley & Sons 2011, available at 
//  * http://www.dafx.de. It may be used for educational purposes and not 
//  * for commercial applications without further permission.
// ported to js by tristan whitehill 2024

class moogLadder extends AudioWorkletProcessor {


    constructor(options) {
      super(options)
      this.stage = new Array(4).fill(0);
      this.stageZ1 = new Array(4).fill(0);
      this.stageTanh = new Array(3).fill(0);
      this.g = 0;
      this.h = 0;
      this.h0 = 0;
      this.lastStage = 0;



    }
  
    static get parameterDescriptors() {
      return [
        {
          name: "gain",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1
        },
        {
          name: "frequency",
          defaultValue: 100,
          minValue: 20,
          maxValue: 10000.0,
          automationRate: "k-rate",
  
        },
        {
          name: "resonance",
          defaultValue: .3,
          minValue: 0,
          maxValue: .9,
          
  
        },
        {
          name: "sr",
          defaultValue: 44100,
          minValue: 44100,
          maxValue: 48000
        }
      ];
    }
     SNAP_TO_ZERO(n){    if (! (n < -1.0e-8 || n > 1.0e-8)) n = 0;}
   
    process(inputs, outputs, parameters) {
      const output = outputs[0];
  
     
      let currentSample = 0;
      let inSample = 0;
      let input = inputs[0];

      let fs2 = parameters.sr;
		
    
      this.g = (2*Math.PI) * parameters.frequency / fs2; 
      this.g *= Math.PI / 1.3; 
      
  
      this.h = this.g / 1.3;
      this.h0 = this.g * 0.3 / 1.3;
      for (let channel = 0; channel < input.length; ++channel) {
        for (let sample = 0; sample < input[channel].length; ++sample) {
         
            for (let stageIdx = 0; stageIdx < 4; ++stageIdx)
                {
                    if (stageIdx)
                    {
                        inSample = this.stage[stageIdx-1];
                        this.stageTanh[stageIdx-1] = Math.tanh(input[channel][sample]);
                        this.stage[stageIdx] = (this.h * this.stageZ1[stageIdx] +
                             this.h0 * this.stageTanh[stageIdx-1]) + (1.0 - this.g) * 
                             (stageIdx != 3 ? this.stageTanh[stageIdx] : Math.tanh(this.stageZ1[stageIdx]));
                    }
                    else
                    {
                        inSample = input[channel][sample] - ((4.0 * parameters.resonance) * (currentSample - parameters.gain * input[channel][sample]));
                        this.stage[stageIdx] = (this.h * Math.tanh(inSample) + this.h0 *
                         this.stageZ1[stageIdx]) + (1.0 - this.g) * this.stageTanh[stageIdx];
                    }
                    
                    this.stageZ1[stageIdx] = this.stage[stageIdx];
                }
                
                currentSample = this.stage[3];
                this.SNAP_TO_ZERO(currentSample);
                

  
  
                output[channel][sample] = currentSample;
            }
       
        }
      
      return true;
    }
  }
  
  registerProcessor("moogladder", moogLadder);