import("stdfaust.lib");
import("soundfiles.lib");



temp = hslider("temp",120,20,200,1);
tran = hslider("tran",60,24,110,1);
filt = hslider("filt",200,30,1000,.1);
stl = hslider("stl",8,1,8,1);
kstl = hslider("kstl",8,1,8,1);
sstl = hslider("sstl",8,1,8,1);
astl = hslider("sstl",8,1,8,1);



c1 = checkbox("c1");
c2 = checkbox("c2");
c3 = checkbox("c3");
c4 = checkbox("c4");
c5 = checkbox("c5");
c6 = checkbox("c6");
c7 = checkbox("c7");
c8 = checkbox("c8");

kc1 = checkbox("kc1");
kc2 = checkbox("kc2");
kc3 = checkbox("kc3");
kc4 = checkbox("kc4");
kc5 = checkbox("kc5");
kc6 = checkbox("kc6");
kc7 = checkbox("kc7");
kc8 = checkbox("kc8");

sc1 = checkbox("sc1");
sc2 = checkbox("sc2");
sc3 = checkbox("sc3");
sc4 = checkbox("sc4");
sc5 = checkbox("sc5");
sc6 = checkbox("sc6");
sc7 = checkbox("sc7");
sc8 = checkbox("sc8");

sp1 = checkbox("sp1");
sp2 = checkbox("sp2");
sp3 = checkbox("sp3");
sp4 = checkbox("sp4");
sp5 = checkbox("sp5");
sp6 = checkbox("sp6");
sp7 = checkbox("sp7");
sp8 = checkbox("sp8");

s1 = hslider("s1",0,0,12,1);
s2 = hslider("s2",0,0,12,1);
s3 = hslider("s3",0,0,12,1);
s4 = hslider("s4",0,0,12,1);
s5 = hslider("s5",0,0,12,1);
s6 = hslider("s6",0,0,12,1);
s7 = hslider("s7",0,0,12,1);
s8 = hslider("s8",0,0,12,1);
smootha = hslider("smootha",0,0,.02,.0001);


be = ba.beat(temp*4);


step = ba.counter(be) % stl :vbargraph("step",0,7);
kstep = ba.counter(be) % kstl :vbargraph("kstep",0,7);
sstep = ba.counter(be) % sstl :vbargraph("sstep",0,7);
astep = ba.counter(be) % astl :vbargraph("astep",0,7);

na = no.lfnoise(temp/64)*5:abs:round;
tabg =c1,c2,c3,c4,c5,c6,c7,c8 : ba.selectn(8,step);
tabs =s1,s2,s3,s4,s5,s6,s7,s8 : ba.selectn(8,step);
tabk =kc1,kc2,kc3,kc4,kc5,kc6,kc7,kc8 : ba.selectn(8,kstep);
tabsn =sc1,sc2,sc3,sc4,sc5,sc6,sc7,sc8 : ba.selectn(8,sstep);
taba =sp1,sp2,sp3,sp4,sp5,sp6,sp7,sp8 : ba.selectn(8,astep);
ts = 0,1,2,3,4: ba.selectn(5,na);


kk =ba.countup(4,ba.beat(temp*4));
vk = ba.if(tabk==1 & kk == 1,0,tabk) ;
vg = ba.if(tabg==1 & kk == 1,0,tabg) ;
vs = ba.if(tabsn==1 & kk == 1,0,tabsn) ;
as = ba.if(taba==1 & kk == 1,0,taba) ;
N = int(2^19); 
p =  ba.midikey2hz(tabs + tran) : si.smooth(ba.tau2pole(smootha));
p2 =  ba.midikey2hz(tabs + tran + 24);
wl = os.sawtooth(p)*en.ar(.001,.3,vg) : fi.resonlp(si.smoo(filt),.9,.6);

wr = os.sawtooth(p+(no.lfnoise(1)*2))*en.ar(.001,.3,vg) : fi.resonlp(si.smoo(filt),2,.6) ;


kp = hslider("kp",0,0,.7,.001):si.smoo;
k = os.oscsin((en.ar(0.001,kp,vk))*p/2)*en.ar(.001,kp,vk);
ap=hslider("amen",0,0,1,.001):si.smoo;
snp = hslider("sp",0,0,.7,.001):si.smoo;
s = (no.noise * .5 + os.oscsin(p+(en.ar(snp,snp,tabsn))))
*en.adsr(.000,snp,.1,.1,vs) : fi.resonhp(si.smoo(1400),.7,.6) ;
dist = hslider("dist",1,1,8,.01);

amen = soundfile("[url:{'https://raw.githubusercontent.com/stanybebe/stanybebe.github.io/master/A04.mp3';'https://raw.githubusercontent.com/stanybebe/stanybebe.github.io/master/A05.mp3';'https://raw.githubusercontent.com/stanybebe/stanybebe.github.io/master/A06.mp3';'https://raw.githubusercontent.com/stanybebe/stanybebe.github.io/master/A07.mp3';'https://raw.githubusercontent.com/stanybebe/stanybebe.github.io/master/A08.mp3'}]",2);



as1 = so.sound(amen,ts);

aout = as1.play_interp(440.0,p2+48, 0.5,as,it.linear):>_:fi.highpass(2,p)*en.ar(.000,ap,as);
synthGain = si.smoo(hslider("synthGain",.5,0,.5,.01));
kickGain = si.smoo(hslider("kickGain",.5,0,.5,.01));
snareGain = si.smoo(hslider("snareGain",.5,0,.5,.01));
amenGain = si.smoo(hslider("amenGain",.5,0,.5,.01));
wet = (wl+wr)/2:ef.echo(10,si.smoo(temp/(240)),.9)*si.smoo(hslider("wet",.3,0,.3,.01));
process =aa.tanh1(((wl*synthGain)+(k*kickGain)+(s*snareGain)+(aout*amenGain))*dist+wet),aa.tanh1(((wr*synthGain)+(k*kickGain)+(s*snareGain)+(aout*amenGain))*dist+wet);