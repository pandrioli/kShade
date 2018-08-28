
#ifdef GL_ES
	precision highp float;
#endif

#define iTime time
#define iResolution resolution
#define iMouse mouse

uniform sampler2D backbuffer;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

float rand(vec2 p) {return fract(sin(dot(p,vec2(2132.342,4323.343)))*1325.2158);}
float speed=4.;

float blob(float x,float y,float fx,float fy){
   float xx = x+sin(iTime*fx/speed)*.7;
   float yy = y+cos(iTime*fy/speed)*.7;

   return 20.0/sqrt(xx*xx+yy*yy);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
   vec2 uv = ( fragCoord.xy / iResolution.xy )-0.5;

   float x = uv.x*2.0;
   float y = uv.y*2.0;

   float a = blob(x,y,3.3,3.2) + blob(x,y,3.9,3.0);
   float b = blob(x,y,3.2,2.9) + blob(x,y,2.7,2.7);
   float c = blob(x,y,2.4,3.3) + blob(x,y,2.8,2.3);

   vec3 d = vec3(a,b,c)/60.0;

	 float n = rand(uv*2.1213+mod(iTime*.12312,5.));

	 fragCoord+=n;

	 d*=.7+rand(uv+mod(iTime*.1,5.))*.3;
	 d*=.2+mod(fragCoord.y,4.)/4.*.5;
   fragColor = vec4(d.x,d.y,d.z,1.0)+.2;
}

void main()
{
	vec4 fragColor;
	mainImage(fragColor, gl_FragCoord.xy);
	gl_FragColor = fragColor;
}
