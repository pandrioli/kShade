
#ifdef GL_ES
	precision highp float;
#endif

#define iGlobalTime time
#define iResolution resolution
#define iMouse mouse

uniform sampler2D backbuffer;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy-.5;
    vec2 p = uv; uv*=2.;
    p.x*=iResolution.x/iResolution.y;
    float t=iGlobalTime*.1;
    p+=vec2(2.,3.);
    p*=.2;
    vec3 p3=vec3(p,abs(1.-mod(iGlobalTime*.01,2.)));
    float m=0.;
    for (int i=0; i<10; i++) {
    	p3=abs(p3)/dot(p3,p3)-.8;
        m+=length(p3)/12.;
    }
	fragColor = vec4(min(1.,pow(m*.6,3.)))*max(0.,1.-length(uv*uv*uv))*min(1.,iGlobalTime*.2);
}

void main() {
	vec4 fragColor;
	mainImage(fragColor, gl_FragCoord.xy);
	gl_FragColor=fragColor;
}