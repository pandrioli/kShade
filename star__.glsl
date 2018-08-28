

float rand(vec2 p) {return fract(sin(dot(p,vec2(2132.342,4323.343)))*1325.2158);}

mat3 lookat(vec3 fw,vec3 up){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,normalize(up)));return mat3(rt,cross(rt,fw),fw);
}

float sphere(vec3 p, vec3 rd, float r){
	float b = dot( -p, rd ), i = b*b - dot(p,p) + r*r;
	return i < 0. ?  -1. : b - sqrt(i);
}


mat2 rot(float a) {
    float si = sin(a);
    float co = cos(a);
    return mat2(co,si,-si,co);
}

float snoise(vec3 uv, float res)
{

    const vec3 s = vec3(1e0, 1e2, 1e4);

	uv *= res;

	vec3 uv0 = floor(mod(uv, res))*s;
	vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;

	vec3 f = fract(uv); f = f*f*(3.0-2.0*f);

	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
		      	  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);

	vec4 r = fract(sin(v*1e-3)*1e5);
	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

	r = fract(sin((v + uv1.z - uv0.z)*1e-3)*1e5);
	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

	return mix(r0, r1, f.z)*2.-1.;
}

float kset(vec3 p) {
  p*=surf_scale*(1.+outer_radius);
  float m=1000.;
	for (int i=0; i<20; i++) {
		if (i>surf_iterations) break;
		float d=dot(p,p);
		p=abs(p)/d*surf_param_2-vec3(surf_param_1);
		m=min(m,abs(d-surf_param_3))*(1.+surf_param_3);
  }
  float c=pow(max(0.,1.-m)/1.,surf_exp);
	c=pow(c,surf_exp)*surf_exp*surf_intensity;
	return c;
}

float cor(vec2 p, float iradius, float oradius, float corsize) {
	float ti=iTime*cor_speed*cor_param_1+100.;
  float d=length(p);
	//float fad = 1.-pow(smoothstep(outer_radius,outer_radius+cor_size,d),1./cor_exp_1);
	//fad*= smoothstep(inner_radius-cor_offset,inner_radius,d);
  float fad = pow(max(0.,1.-(length(p)-oradius)/(oradius+cor_size)),cor_exp_1);
  float v1 = fad;
	float v2 = fad;
	float angle = atan( p.x, p.y )/6.2832;
	float dist = length(p)*cor_param_1/fov;
	vec3 crd = vec3( angle, dist, ti * .1 );
  float ti2=ti+fad*cor_speed_vary*cor_param_1;
  float t1=abs(snoise(crd+vec3(0.,-ti2*.5,ti2*.015),15.));
	float t2=abs(snoise(crd+vec3(0.,-ti2*.3,ti2*.015),45.));
  float it=float(cor_iterations);
  float s=1.;
	for( int i=1; i<=20; i++ ){
		if (i>cor_iterations) break;
		float pw = pow(2.,float(i));
		v1+=snoise(crd+vec3(0.,-ti,ti*.02),(pw*10.*(t1+1.)))/it*s;
		v2+=snoise(crd+vec3(0.,-ti,ti*.02),(pw*25.*(t2+1.)))/it*s;
        s*=cor_iteration_fade;
  }

	float co=pow(v1*fad,cor_exp_2)*cor_brightness;
	co+=pow(v2*fad,cor_exp_2)*cor_brightness;
	co*=1.-t1*cor_param_2*(1.-fad*.3);
  return co;
}

vec3 render(vec2 uv) {
  vec3 ro=vec3(0.,0.,1.);
  ro.xz*=rot(iTime*surf_rotation_speed);
  vec3 rd=normalize(vec3(uv,1.));
	rd.xy*=fov;
  uv*=fov;
  rd=lookat(-ro,vec3(0.,1.,0.))*rd;
  float tot_dist=outer_radius-inner_radius;
	float st=tot_dist/vol_steps;
  float br=1./vol_steps;
  float tr=iTime*surf_rotation_speed;
	float tt=iTime*surf_turbulence_speed;
  float dist=0.;
  float c=0.;
  float dout=step(0.,sphere(ro, rd, outer_radius));
  float d;
  for (float i=0.; i<50.; i++) {
		if (i>vol_steps) break;
    d=sphere(ro, rd, inner_radius+i*st);
    dist+=st;
    vec3 p = ro+rd*d;
    float a=vol_rot*i;
    p.yz*=rot(a);
    p.xy*=rot(tt+a);
    c+=kset(p)*br*step(0.,d)*max(0.,1.-smoothstep(0.,tot_dist,dist)*vol_fade);
  }
  float ir=inner_radius*fov;
  float or=outer_radius*fov;
  float gsz=glow_size*fov;
  float csz=cor_size*fov;
	c+=surf_base_value;
  float rxy=1.-smoothstep(inner_radius,outer_radius,length(uv));
  vec3 col=mix(color_1, color_2, c)*dout*rxy;
  float cor=cor(uv,ir,or,csz);
  float l=smoothstep(ir-cor_offset,or, length(uv));
  float rt=or+gsz;
  float sw=1.-smoothstep(0.,rt,length(uv));
  col=pow(col,vec3(surf_contrast))*surf_brightness*surf_contrast;
  col+=cor*color_1*l+sw*color_2*glow_intensity;
  col=mix(vec3(length(col)), col, color_saturation)*color_brightness;
  return pow(col,vec3(color_contrast));
}



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy-.5;
	uv.x*=iResolution.x/iResolution.y;
	vec3 col = render(uv/zoom);
    col=pow(col,vec3(1.5))*vec3(1.1,1.,1.);
    fragColor = vec4(col.bgr,1.0);
}


void main() {
	vec4 fragColor;
	mainImage(fragColor, gl_FragCoord.xy);
	gl_FragColor=fragColor;
}
