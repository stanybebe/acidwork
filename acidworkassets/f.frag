#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform float fraction;
uniform sampler2D tex;
varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 texelSize;
uniform float red;
uniform float green;
uniform float blue;
uniform float dist;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123+sin(u_time*.3));
}

vec2 hash2( vec2 x )
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*(sin(u_time*.3)*5.+ 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    vec2 g00 = hash2(i + vec2(0.0, 0.0));
    vec2 g10 = hash2(i + vec2(1.0, 0.0));
    vec2 g01 = hash2(i + vec2(0.0, 1.0));
    vec2 g11 = hash2(i + vec2(1.0, 1.0));

    float n00 = dot(g00, f - vec2(0.0, 0.0));
    float n10 = dot(g10, f - vec2(1.0, 0.0));
    float n01 = dot(g01, f - vec2(0.0, 1.0));
    float n11 = dot(g11, f - vec2(1.0, 1.0));

    float nx0 = mix(n00, n10, smoothstep(0.5, .6, u.x));
    float nx1 = mix(n01, n11, smoothstep(0.5, .6, u.x));
    float nxy = mix(nx0, nx1, smoothstep(0.5, .6, u.y));

    return nxy;
}


float noisee (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
#define OCTS 3
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = 1.;
    float frequency = 0.6;

    for (int i = 0; i < OCTS; i++) {
        value += amplitude * noisee(st)* noisee(st);
        st *= .9;
        amplitude *= 3.5;
    }
    return value;
}
vec3 randomGradient(in vec2 uv)
{
    vec3 color1 = vec3(0.074, 0.749, 0.941); // #13BFF0
    vec3 color2 = vec3(0.922, 0.004, 0.365); // #EB015D
    vec3 color3 = vec3(0.271, 0.878, 0.055); // #45E10E
    vec3 color4 = vec3(0.929, 0.361, 0.016);

    vec3 c1c2 = mix(color1, color2, smoothstep(0.0, 1.0, uv.x));
    vec3 c3c4 = mix(color3, color4, smoothstep(0.0, 1.0, uv.x));
    vec3 gradient = mix(c1c2, c3c4, smoothstep(0.0, 1.0, uv.y));

    return gradient;
}

void main() {
  float intensity;

      vec2 uv = vTexCoord;
        uv.y = 1.0 - uv.y;
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec2 r = vec2( gl_FragCoord.xy - 0.5*u_resolution.xy );
  float spread = sin(.02+u_time)*30.0;

  vec2 offset = texelSize * spread;
    vec3 col2 = vec3 (red+.2,green+.2,blue+.2);
    vec3 col1 = vec3 (red-.2,green-.2,blue-.2);
    vec3 col3 = vec3(.14,.04,.19);
    vec3 pixi;
     float f = noise(uv*.01);
       float ff = noisee(uv*.01);
  
     float n1 = noise(.0004*r.xy);
     float n2 = noisee(dist*r.xy);
     float speed = .003;
     float sine = mod(sin(r.x*speed+u_time)*.1,n2/n1);
  vec4 texi = texture2D(tex, (uv)); // middle middle -- the actual texel / pixel


    vec4 ctex =texture2D(tex,(uv+n2));
    float n = fbm(.004*r.xy);
   
   float noiseh = n;  
   vec4 warp = vec4(sin(ctex.x*u_time),ctex.y,ctex.z,1.);
        
        if(ctex.x>mod(uv.x,n)){

         pixi = col1;

      }

      else{pixi = col2;}

  
   vec3 randg = randomGradient(uv*n*n2);
    
   gl_FragColor = vec4(pixi,1.);
}