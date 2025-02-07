class slidey {
  constructor(x_pos, y_pos, w, h, val, text, size) {
    this.xpos = 0;
    this.ypos = 0;
    this.width = 0;
    this.height = 0;
    this.value = 0;
    this.map = 0;
    this.omax = 0;
    this.omin = 0;
    this.s = 0;
    this.c1 = 2;
    this.xpos = x_pos;
    this.ypos = y_pos;
    this.width = w;
    this.height = h;
    this.value = val;
    this.pv = 0;
    this.text = text;
    this.size = size;
  }

  draw(ca, cb, cc) {
    this.c1--;

    push();
    noStroke();

    for (let i = 0; i < this.width; i++) {
      fill(cc);
      rect(this.xpos + i + 2, this.ypos + 2, 6, this.height);

      fill(ca);
      rect(this.xpos + i, this.ypos, 6, this.height);
      let p = floor(map(this.value, 0, 1, 0, this.width));
      if (p <= i) {
        fill(cb);
        rect(this.xpos + i, this.ypos, 6, this.height);
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
          this.c1 = 1;
        }
      }
    }

    pop();

    push();
    fill(0);
    textFont(tf, this.size);
    let dm;
    if(typeof this.map === 'number'){
       if(this.s==0){
        dm = floor(this.map*100)/100;
       }
       else{
        dm = this.map;
       }
    }
    text(this.text+dm, this.xpos, this.ypos-this.height);
    pop();
  }

  cache(){
    if(this.pv!=this.value){
      this.pv=this.value;
      return true
    }else{
      return false;
    }
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
        this.map = round(map(this.value, 0, 1, this.omin, this.omax));
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
    this.pv = 0;
  }

  cache(){
    if(this.pv!=this.value){
      this.pv=this.value;
      return true
    }else{
      return false;
    }
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
    this.togg = new tog(x+w/4, y, (w / 2), h);
    this.sldA = new slidey(x - w /2, y + h / 2, w*1.5, h / 3,0,"",1);
    // this.sldB = new slidey(x - w /2, y + h, w*1.5, h / 3, 0,"",);
    
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
    this.sldA.draw(ca,cb,this.cola);

  }
  setCol(c){
    this.cola = c;
  }
  getTog() {
    return this.togg.value;
  }
  getSlideA(mn,mx,r) {
    return this.sldA.getValue(mn,mx,r);
  }
  getSlideB(mn,mx,r) {
    return this.sldB.getValue(mn,mx,r);
  }}
