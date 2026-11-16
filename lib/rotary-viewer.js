(()=>{var qi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Yi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},vh=0,Zl=1,Mh=2;var us=1,Sh=2,er=3,pi=0,an=1,Ye=2,mi=0,nr=1,Jl=2,Kl=3,$l=4,bh=5;var ds=100,Eh=101,Th=102,wh=103,Ah=104,Rh=200,Ch=201,Ph=202,Ih=203,jl=204,Ql=205,Lh=206,Dh=207,Nh=208,Uh=209,Fh=210,Oh=211,Bh=212,zh=213,kh=214,Fa=0,Oa=1,Ba=2,Os=3,za=4,ka=5,Ha=6,Va=7,tc=0,Hh=1,Vh=2,ni=0,ec=1,nc=2,ic=3,sc=4,rc=5,ac=6,oc=7;var lc=300,Zi=301,fs=302,mo=303,go=304,Vr=306,Ga=1e3,ui=1001,Wa=1002,sn=1003,Gh=1004;var Gr=1005;var cn=1006,_o=1007;var Ji=1008;var Sn=1009,cc=1010,hc=1011,ir=1012,xo=1013,ii=1014,Wn=1015,si=1016,yo=1017,vo=1018,sr=1020,uc=35902,dc=35899,fc=1021,pc=1022,Xn=1023,di=1026,Ki=1027,Mo=1028,So=1029,$i=1030,bo=1031;var Eo=1033,Wr=33776,Xr=33777,qr=33778,Yr=33779,To=35840,wo=35841,Ao=35842,Ro=35843,Co=36196,Po=37492,Io=37496,Lo=37488,Do=37489,Zr=37490,No=37491,Uo=37808,Fo=37809,Oo=37810,Bo=37811,zo=37812,ko=37813,Ho=37814,Vo=37815,Go=37816,Wo=37817,Xo=37818,qo=37819,Yo=37820,Zo=37821,Jo=36492,Ko=36494,$o=36495,jo=36283,Qo=36284,Jr=36285,tl=36286;var br=2300,Xa=2301,Na=2302,kl=2303,Hl=2400,Vl=2401,Gl=2402;var Wh=3200;var el=0,Xh=1,Pi="",$e="srgb",Er="srgb-linear",Tr="linear",Pe="srgb";var Ua=7680;var qh=519,Yh=512,Zh=513,Jh=514,nl=515,Kh=516,$h=517,il=518,jh=519,mc=35044;var gc="300 es",ti=2e3,Bs=2001;function Gu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Wu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function wr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qh(){let i=wr("canvas");return i.style.display="block",i}var Hc={},zs=null;function Ar(...i){let t="THREE."+i.shift();zs?zs("log",t,...i):console.log(t,...i)}function tu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function $t(...i){i=tu(i);let t="THREE."+i.shift();if(zs)zs("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Qt(...i){i=tu(i);let t="THREE."+i.shift();if(zs)zs("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function os(...i){let t=i.join(" ");t in Hc||(Hc[t]=!0,$t(...i))}function eu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var nu={[Fa]:Oa,[Ba]:Ha,[za]:Va,[Os]:ka,[Oa]:Fa,[Ha]:Ba,[Va]:za,[ka]:Os},ei=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},un=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Vc=1234567,Us=Math.PI/180,ks=180/Math.PI;function bi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(un[i&255]+un[i>>8&255]+un[i>>16&255]+un[i>>24&255]+"-"+un[t&255]+un[t>>8&255]+"-"+un[t>>16&15|64]+un[t>>24&255]+"-"+un[e&63|128]+un[e>>8&255]+"-"+un[e>>16&255]+un[e>>24&255]+un[n&255]+un[n>>8&255]+un[n>>16&255]+un[n>>24&255]).toLowerCase()}function me(i,t,e){return Math.max(t,Math.min(e,i))}function _c(i,t){return(i%t+t)%t}function Xu(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function qu(i,t,e){return i!==t?(e-i)/(t-i):0}function Sr(i,t,e){return(1-e)*i+e*t}function Yu(i,t,e,n){return Sr(i,t,1-Math.exp(-e*n))}function Zu(i,t=1){return t-Math.abs(_c(i,t*2)-t)}function Ju(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Ku(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function $u(i,t){return i+Math.floor(Math.random()*(t-i+1))}function ju(i,t){return i+Math.random()*(t-i)}function Qu(i){return i*(.5-Math.random())}function td(i){i!==void 0&&(Vc=i);let t=Vc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ed(i){return i*Us}function nd(i){return i*ks}function id(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function sd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function rd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ad(i,t,e,n,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),u=a((t+n)/2),f=r((t-n)/2),h=a((t-n)/2),m=r((n-t)/2),x=a((n-t)/2);switch(s){case"XYX":i.set(o*u,l*f,l*h,o*c);break;case"YZY":i.set(l*h,o*u,l*f,o*c);break;case"ZXZ":i.set(l*f,l*h,o*u,o*c);break;case"XZX":i.set(o*u,l*x,l*m,o*c);break;case"YXY":i.set(l*m,o*u,l*x,o*c);break;case"ZYZ":i.set(l*x,l*m,o*u,o*c);break;default:$t("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Qn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ie(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var xc={DEG2RAD:Us,RAD2DEG:ks,generateUUID:bi,clamp:me,euclideanModulo:_c,mapLinear:Xu,inverseLerp:qu,lerp:Sr,damp:Yu,pingpong:Zu,smoothstep:Ju,smootherstep:Ku,randInt:$u,randFloat:ju,randFloatSpread:Qu,seededRandom:td,degToRad:ed,radToDeg:nd,isPowerOfTwo:id,ceilPowerOfTwo:sd,floorPowerOfTwo:rd,setQuaternionFromProperEuler:ad,normalize:Ie,denormalize:Qn},Ft=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=me(this.x,t.x,e.x),this.y=me(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=me(this.x,t,e),this.y=me(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(me(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ln=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],m=r[a+1],x=r[a+2],S=r[a+3];if(f!==S||l!==h||c!==m||u!==x){let p=l*h+c*m+u*x+f*S;p<0&&(h=-h,m=-m,x=-x,S=-S,p=-p);let d=1-o;if(p<.9995){let w=Math.acos(p),D=Math.sin(w);d=Math.sin(d*w)/D,o=Math.sin(o*w)/D,l=l*d+h*o,c=c*d+m*o,u=u*d+x*o,f=f*d+S*o}else{l=l*d+h*o,c=c*d+m*o,u=u*d+x*o,f=f*d+S*o;let w=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=w,c*=w,u*=w,f*=w}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[a],h=r[a+1],m=r[a+2],x=r[a+3];return t[e]=o*x+u*f+l*m-c*h,t[e+1]=l*x+u*h+c*f-o*m,t[e+2]=c*x+u*m+o*h-l*f,t[e+3]=u*x-o*f-l*h-c*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),f=o(r/2),h=l(n/2),m=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=h*u*f+c*m*x,this._y=c*m*f-h*u*x,this._z=c*u*x+h*m*f,this._w=c*u*f-h*m*x;break;case"YXZ":this._x=h*u*f+c*m*x,this._y=c*m*f-h*u*x,this._z=c*u*x-h*m*f,this._w=c*u*f+h*m*x;break;case"ZXY":this._x=h*u*f-c*m*x,this._y=c*m*f+h*u*x,this._z=c*u*x+h*m*f,this._w=c*u*f-h*m*x;break;case"ZYX":this._x=h*u*f-c*m*x,this._y=c*m*f+h*u*x,this._z=c*u*x-h*m*f,this._w=c*u*f+h*m*x;break;case"YZX":this._x=h*u*f+c*m*x,this._y=c*m*f+h*u*x,this._z=c*u*x-h*m*f,this._w=c*u*f-h*m*x;break;case"XZY":this._x=h*u*f-c*m*x,this._y=c*m*f-h*u*x,this._z=c*u*x+h*m*f,this._w=c*u*f+h*m*x;break;default:$t("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],f=e[10],h=n+o+f;if(h>0){let m=.5/Math.sqrt(h+1);this._w=.25/m,this._x=(u-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>f){let m=2*Math.sqrt(1+n-o-f);this._w=(u-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>f){let m=2*Math.sqrt(1+o-n-f);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+u)/m}else{let m=2*Math.sqrt(1+f-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(me(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Gc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Gc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+l*c+a*f-o*u,this.y=n+l*u+o*c-r*f,this.z=s+l*f+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=me(this.x,t.x,e.x),this.y=me(this.y,t.y,e.y),this.z=me(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=me(this.x,t,e),this.y=me(this.y,t,e),this.z=me(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ml.copy(this).projectOnVector(t),this.sub(ml)}reflect(t){return this.sub(ml.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(me(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ml=new I,Gc=new Ln,se=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],m=n[5],x=n[8],S=s[0],p=s[3],d=s[6],w=s[1],D=s[4],M=s[7],b=s[2],T=s[5],P=s[8];return r[0]=a*S+o*w+l*b,r[3]=a*p+o*D+l*T,r[6]=a*d+o*M+l*P,r[1]=c*S+u*w+f*b,r[4]=c*p+u*D+f*T,r[7]=c*d+u*M+f*P,r[2]=h*S+m*w+x*b,r[5]=h*p+m*D+x*T,r[8]=h*d+m*M+x*P,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=u*a-o*c,h=o*l-u*r,m=c*r-a*l,x=e*f+n*h+s*m;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/x;return t[0]=f*S,t[1]=(s*c-u*n)*S,t[2]=(o*n-s*a)*S,t[3]=h*S,t[4]=(u*e-s*l)*S,t[5]=(s*r-o*e)*S,t[6]=m*S,t[7]=(n*l-c*e)*S,t[8]=(a*e-n*r)*S,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return os("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(gl.makeScale(t,e)),this}rotate(t){return os("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(gl.makeRotation(-t)),this}translate(t,e){return os("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(gl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},gl=new se,Wc=new se().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Xc=new se().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function od(){let i={enabled:!0,workingColorSpace:Er,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Pe&&(s.r=Ei(s.r),s.g=Ei(s.g),s.b=Ei(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Pe&&(s.r=Fs(s.r),s.g=Fs(s.g),s.b=Fs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Pi?Tr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return os("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return os("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Er]:{primaries:t,whitePoint:n,transfer:Tr,toXYZ:Wc,fromXYZ:Xc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:$e},outputColorSpaceConfig:{drawingBufferColorSpace:$e}},[$e]:{primaries:t,whitePoint:n,transfer:Pe,toXYZ:Wc,fromXYZ:Xc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:$e}}}),i}var _e=od();function Ei(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Fs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var _s,qa=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{_s===void 0&&(_s=wr("canvas")),_s.width=t.width,_s.height=t.height;let s=_s.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=_s}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=wr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ei(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ei(e[n]/255)*255):e[n]=Ei(e[n]);return{data:e,width:t.width,height:t.height}}else return $t("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},ld=0,Hs=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ld++}),this.uuid=bi(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(_l(s[a].image)):r.push(_l(s[a]))}else r=_l(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function _l(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?qa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:($t("Texture: Unable to serialize Texture."),{})}var cd=0,xl=new I,gn=class i extends ei{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=ui,s=ui,r=cn,a=Ji,o=Xn,l=Sn,c=i.DEFAULT_ANISOTROPY,u=Pi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cd++}),this.uuid=bi(),this.name="",this.source=new Hs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ft(0,0),this.repeat=new Ft(1,1),this.center=new Ft(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new se,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(xl).x}get height(){return this.source.getSize(xl).y}get depth(){return this.source.getSize(xl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){$t(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){$t(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==lc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ga:t.x=t.x-Math.floor(t.x);break;case ui:t.x=t.x<0?0:1;break;case Wa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ga:t.y=t.y-Math.floor(t.y);break;case ui:t.y=t.y<0?0:1;break;case Wa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=lc;gn.DEFAULT_ANISOTROPY=1;var Oe=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],f=l[8],h=l[1],m=l[5],x=l[9],S=l[2],p=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-S)<.01&&Math.abs(x-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+S)<.1&&Math.abs(x+p)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let D=(c+1)/2,M=(m+1)/2,b=(d+1)/2,T=(u+h)/4,P=(f+S)/4,_=(x+p)/4;return D>M&&D>b?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=T/n,r=P/n):M>b?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=T/s,r=_/s):b<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(b),n=P/r,s=_/r),this.set(n,s,r,e),this}let w=Math.sqrt((p-x)*(p-x)+(f-S)*(f-S)+(h-u)*(h-u));return Math.abs(w)<.001&&(w=1),this.x=(p-x)/w,this.y=(f-S)/w,this.z=(h-u)/w,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=me(this.x,t.x,e.x),this.y=me(this.y,t.y,e.y),this.z=me(this.z,t.z,e.z),this.w=me(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=me(this.x,t,e),this.y=me(this.y,t,e),this.z=me(this.z,t,e),this.w=me(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ya=class extends ei{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:cn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Oe(0,0,t,e),this.scissorTest=!1,this.viewport=new Oe(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new gn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:cn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Hs(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},vn=class extends Ya{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Rr=class extends gn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=sn,this.minFilter=sn,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Za=class extends gn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=sn,this.minFilter=sn,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Ee=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,a,o,l,c,u,f,h,m,x,S,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,f,h,m,x,S,p)}set(t,e,n,s,r,a,o,l,c,u,f,h,m,x,S,p){let d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=f,d[14]=h,d[3]=m,d[7]=x,d[11]=S,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/xs.setFromMatrixColumn(t,0).length(),r=1/xs.setFromMatrixColumn(t,1).length(),a=1/xs.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let h=a*u,m=a*f,x=o*u,S=o*f;e[0]=l*u,e[4]=-l*f,e[8]=c,e[1]=m+x*c,e[5]=h-S*c,e[9]=-o*l,e[2]=S-h*c,e[6]=x+m*c,e[10]=a*l}else if(t.order==="YXZ"){let h=l*u,m=l*f,x=c*u,S=c*f;e[0]=h+S*o,e[4]=x*o-m,e[8]=a*c,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=m*o-x,e[6]=S+h*o,e[10]=a*l}else if(t.order==="ZXY"){let h=l*u,m=l*f,x=c*u,S=c*f;e[0]=h-S*o,e[4]=-a*f,e[8]=x+m*o,e[1]=m+x*o,e[5]=a*u,e[9]=S-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let h=a*u,m=a*f,x=o*u,S=o*f;e[0]=l*u,e[4]=x*c-m,e[8]=h*c+S,e[1]=l*f,e[5]=S*c+h,e[9]=m*c-x,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let h=a*l,m=a*c,x=o*l,S=o*c;e[0]=l*u,e[4]=S-h*f,e[8]=x*f+m,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=m*f+x,e[10]=h-S*f}else if(t.order==="XZY"){let h=a*l,m=a*c,x=o*l,S=o*c;e[0]=l*u,e[4]=-f,e[8]=c*u,e[1]=h*f+S,e[5]=a*u,e[9]=m*f-x,e[2]=x*f-m,e[6]=o*u,e[10]=S*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hd,t,ud)}lookAt(t,e,n){let s=this.elements;return Cn.subVectors(t,e),Cn.lengthSq()===0&&(Cn.z=1),Cn.normalize(),Ni.crossVectors(n,Cn),Ni.lengthSq()===0&&(Math.abs(n.z)===1?Cn.x+=1e-4:Cn.z+=1e-4,Cn.normalize(),Ni.crossVectors(n,Cn)),Ni.normalize(),ra.crossVectors(Cn,Ni),s[0]=Ni.x,s[4]=ra.x,s[8]=Cn.x,s[1]=Ni.y,s[5]=ra.y,s[9]=Cn.y,s[2]=Ni.z,s[6]=ra.z,s[10]=Cn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],m=n[13],x=n[2],S=n[6],p=n[10],d=n[14],w=n[3],D=n[7],M=n[11],b=n[15],T=s[0],P=s[4],_=s[8],E=s[12],L=s[1],z=s[5],H=s[9],G=s[13],U=s[2],Z=s[6],Y=s[10],nt=s[14],j=s[3],$=s[7],st=s[11],W=s[15];return r[0]=a*T+o*L+l*U+c*j,r[4]=a*P+o*z+l*Z+c*$,r[8]=a*_+o*H+l*Y+c*st,r[12]=a*E+o*G+l*nt+c*W,r[1]=u*T+f*L+h*U+m*j,r[5]=u*P+f*z+h*Z+m*$,r[9]=u*_+f*H+h*Y+m*st,r[13]=u*E+f*G+h*nt+m*W,r[2]=x*T+S*L+p*U+d*j,r[6]=x*P+S*z+p*Z+d*$,r[10]=x*_+S*H+p*Y+d*st,r[14]=x*E+S*G+p*nt+d*W,r[3]=w*T+D*L+M*U+b*j,r[7]=w*P+D*z+M*Z+b*$,r[11]=w*_+D*H+M*Y+b*st,r[15]=w*E+D*G+M*nt+b*W,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],f=t[6],h=t[10],m=t[14],x=t[3],S=t[7],p=t[11],d=t[15],w=l*m-c*h,D=o*m-c*f,M=o*h-l*f,b=a*m-c*u,T=a*h-l*u,P=a*f-o*u;return e*(S*w-p*D+d*M)-n*(x*w-p*b+d*T)+s*(x*D-S*b+d*P)-r*(x*M-S*T+p*P)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=t[9],h=t[10],m=t[11],x=t[12],S=t[13],p=t[14],d=t[15],w=e*o-n*a,D=e*l-s*a,M=e*c-r*a,b=n*l-s*o,T=n*c-r*o,P=s*c-r*l,_=u*S-f*x,E=u*p-h*x,L=u*d-m*x,z=f*p-h*S,H=f*d-m*S,G=h*d-m*p,U=w*G-D*H+M*z+b*L-T*E+P*_;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let Z=1/U;return t[0]=(o*G-l*H+c*z)*Z,t[1]=(s*H-n*G-r*z)*Z,t[2]=(S*P-p*T+d*b)*Z,t[3]=(h*T-f*P-m*b)*Z,t[4]=(l*L-a*G-c*E)*Z,t[5]=(e*G-s*L+r*E)*Z,t[6]=(p*M-x*P-d*D)*Z,t[7]=(u*P-h*M+m*D)*Z,t[8]=(a*H-o*L+c*_)*Z,t[9]=(n*L-e*H-r*_)*Z,t[10]=(x*T-S*M+d*w)*Z,t[11]=(f*M-u*T-m*w)*Z,t[12]=(o*E-a*z-l*_)*Z,t[13]=(e*z-n*E+s*_)*Z,t[14]=(S*D-x*b-p*w)*Z,t[15]=(u*b-f*D+h*w)*Z,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,f=o+o,h=r*c,m=r*u,x=r*f,S=a*u,p=a*f,d=o*f,w=l*c,D=l*u,M=l*f,b=n.x,T=n.y,P=n.z;return s[0]=(1-(S+d))*b,s[1]=(m+M)*b,s[2]=(x-D)*b,s[3]=0,s[4]=(m-M)*T,s[5]=(1-(h+d))*T,s[6]=(p+w)*T,s[7]=0,s[8]=(x+D)*P,s[9]=(p-w)*P,s[10]=(1-(h+S))*P,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=xs.set(s[0],s[1],s[2]).length(),o=xs.set(s[4],s[5],s[6]).length(),l=xs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Kn.copy(this);let c=1/a,u=1/o,f=1/l;return Kn.elements[0]*=c,Kn.elements[1]*=c,Kn.elements[2]*=c,Kn.elements[4]*=u,Kn.elements[5]*=u,Kn.elements[6]*=u,Kn.elements[8]*=f,Kn.elements[9]*=f,Kn.elements[10]*=f,e.setFromRotationMatrix(Kn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=ti,l=!1){let c=this.elements,u=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),m=(n+s)/(n-s),x,S;if(l)x=r/(a-r),S=a*r/(a-r);else if(o===ti)x=-(a+r)/(a-r),S=-2*a*r/(a-r);else if(o===Bs)x=-a/(a-r),S=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=S,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=ti,l=!1){let c=this.elements,u=2/(e-t),f=2/(n-s),h=-(e+t)/(e-t),m=-(n+s)/(n-s),x,S;if(l)x=1/(a-r),S=a/(a-r);else if(o===ti)x=-2/(a-r),S=-(a+r)/(a-r);else if(o===Bs)x=-1/(a-r),S=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=x,c[14]=S,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},xs=new I,Kn=new Ee,hd=new I(0,0,0),ud=new I(1,1,1),Ni=new I,ra=new I,Cn=new I,qc=new Ee,Yc=new Ln,Ti=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(me(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-me(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(me(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-me(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(me(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-me(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:$t("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return qc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(qc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Yc.setFromEuler(this),this.setFromQuaternion(Yc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ti.DEFAULT_ORDER="XYZ";var Vs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},dd=0,Zc=new I,ys=new Ln,xi=new Ee,aa=new I,dr=new I,fd=new I,pd=new Ln,Jc=new I(1,0,0),Kc=new I(0,1,0),$c=new I(0,0,1),jc={type:"added"},md={type:"removed"},vs={type:"childadded",child:null},yl={type:"childremoved",child:null},je=class i extends ei{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new I,e=new Ti,n=new Ln,s=new I(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ee},normalMatrix:{value:new se}}),this.matrix=new Ee,this.matrixWorld=new Ee,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ys.setFromAxisAngle(t,e),this.quaternion.multiply(ys),this}rotateOnWorldAxis(t,e){return ys.setFromAxisAngle(t,e),this.quaternion.premultiply(ys),this}rotateX(t){return this.rotateOnAxis(Jc,t)}rotateY(t){return this.rotateOnAxis(Kc,t)}rotateZ(t){return this.rotateOnAxis($c,t)}translateOnAxis(t,e){return Zc.copy(t).applyQuaternion(this.quaternion),this.position.add(Zc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Jc,t)}translateY(t){return this.translateOnAxis(Kc,t)}translateZ(t){return this.translateOnAxis($c,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(xi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?aa.copy(t):aa.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xi.lookAt(dr,aa,this.up):xi.lookAt(aa,dr,this.up),this.quaternion.setFromRotationMatrix(xi),s&&(xi.extractRotation(s.matrixWorld),ys.setFromRotationMatrix(xi),this.quaternion.premultiply(ys.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Qt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(jc),vs.child=t,this.dispatchEvent(vs),vs.child=null):Qt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(md),yl.child=t,this.dispatchEvent(yl),yl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),xi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),xi.multiply(t.parent.matrixWorld)),t.applyMatrix4(xi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(jc),vs.child=t,this.dispatchEvent(vs),vs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,t,fd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,pd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),m=a(t.animations),x=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),m.length>0&&(n.animations=m),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};je.DEFAULT_UP=new I(0,1,0);je.DEFAULT_MATRIX_AUTO_UPDATE=!0;je.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var qe=class extends je{constructor(){super(),this.isGroup=!0,this.type="Group"}},gd={type:"move"},Gs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let S of t.hand.values()){let p=e.getJointPose(S,n),d=this._getHandJoint(c,S);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}let u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),m=.02,x=.005;c.inputState.pinching&&h>m+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=m-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(gd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new qe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},iu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ui={h:0,s:0,l:0},oa={h:0,s:0,l:0};function vl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Ot=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=$e){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,_e.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=_e.workingColorSpace){return this.r=t,this.g=e,this.b=n,_e.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=_e.workingColorSpace){if(t=_c(t,1),e=me(e,0,1),n=me(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=vl(a,r,t+1/3),this.g=vl(a,r,t),this.b=vl(a,r,t-1/3)}return _e.colorSpaceToWorking(this,s),this}setStyle(t,e=$e){function n(r){r!==void 0&&parseFloat(r)<1&&$t("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:$t("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);$t("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=$e){let n=iu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):$t("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ei(t.r),this.g=Ei(t.g),this.b=Ei(t.b),this}copyLinearToSRGB(t){return this.r=Fs(t.r),this.g=Fs(t.g),this.b=Fs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=$e){return _e.workingToColorSpace(dn.copy(this),t),Math.round(me(dn.r*255,0,255))*65536+Math.round(me(dn.g*255,0,255))*256+Math.round(me(dn.b*255,0,255))}getHexString(t=$e){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=_e.workingColorSpace){_e.workingToColorSpace(dn.copy(this),e);let n=dn.r,s=dn.g,r=dn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=_e.workingColorSpace){return _e.workingToColorSpace(dn.copy(this),e),t.r=dn.r,t.g=dn.g,t.b=dn.b,t}getStyle(t=$e){_e.workingToColorSpace(dn.copy(this),t);let e=dn.r,n=dn.g,s=dn.b;return t!==$e?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ui),this.setHSL(Ui.h+t,Ui.s+e,Ui.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ui),t.getHSL(oa);let n=Sr(Ui.h,oa.h,e),s=Sr(Ui.s,oa.s,e),r=Sr(Ui.l,oa.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},dn=new Ot;Ot.NAMES=iu;var Cr=class extends je{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ti,this.environmentIntensity=1,this.environmentRotation=new Ti,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},$n=new I,yi=new I,Ml=new I,vi=new I,Ms=new I,Ss=new I,Qc=new I,Sl=new I,bl=new I,El=new I,Tl=new Oe,wl=new Oe,Al=new Oe,hi=class i{constructor(t=new I,e=new I,n=new I){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),$n.subVectors(t,e),s.cross($n);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){$n.subVectors(s,e),yi.subVectors(n,e),Ml.subVectors(t,e);let a=$n.dot($n),o=$n.dot(yi),l=$n.dot(Ml),c=yi.dot(yi),u=yi.dot(Ml),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let h=1/f,m=(c*l-o*u)*h,x=(a*u-o*l)*h;return r.set(1-m-x,x,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,vi)===null?!1:vi.x>=0&&vi.y>=0&&vi.x+vi.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,vi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,vi.x),l.addScaledVector(a,vi.y),l.addScaledVector(o,vi.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Tl.setScalar(0),wl.setScalar(0),Al.setScalar(0),Tl.fromBufferAttribute(t,e),wl.fromBufferAttribute(t,n),Al.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Tl,r.x),a.addScaledVector(wl,r.y),a.addScaledVector(Al,r.z),a}static isFrontFacing(t,e,n,s){return $n.subVectors(n,e),yi.subVectors(t,e),$n.cross(yi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return $n.subVectors(this.c,this.b),yi.subVectors(this.a,this.b),$n.cross(yi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Ms.subVectors(s,n),Ss.subVectors(r,n),Sl.subVectors(t,n);let l=Ms.dot(Sl),c=Ss.dot(Sl);if(l<=0&&c<=0)return e.copy(n);bl.subVectors(t,s);let u=Ms.dot(bl),f=Ss.dot(bl);if(u>=0&&f<=u)return e.copy(s);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(Ms,a);El.subVectors(t,r);let m=Ms.dot(El),x=Ss.dot(El);if(x>=0&&m<=x)return e.copy(r);let S=m*c-l*x;if(S<=0&&c>=0&&x<=0)return o=c/(c-x),e.copy(n).addScaledVector(Ss,o);let p=u*x-m*f;if(p<=0&&f-u>=0&&m-x>=0)return Qc.subVectors(r,s),o=(f-u)/(f-u+(m-x)),e.copy(s).addScaledVector(Qc,o);let d=1/(p+S+h);return a=S*d,o=h*d,e.copy(n).addScaledVector(Ms,a).addScaledVector(Ss,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Je=class{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(jn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(jn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=jn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,jn):jn.fromBufferAttribute(r,a),jn.applyMatrix4(t.matrixWorld),this.expandByPoint(jn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),la.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),la.copy(n.boundingBox)),la.applyMatrix4(t.matrixWorld),this.union(la)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,jn),jn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(fr),ca.subVectors(this.max,fr),bs.subVectors(t.a,fr),Es.subVectors(t.b,fr),Ts.subVectors(t.c,fr),Fi.subVectors(Es,bs),Oi.subVectors(Ts,Es),is.subVectors(bs,Ts);let e=[0,-Fi.z,Fi.y,0,-Oi.z,Oi.y,0,-is.z,is.y,Fi.z,0,-Fi.x,Oi.z,0,-Oi.x,is.z,0,-is.x,-Fi.y,Fi.x,0,-Oi.y,Oi.x,0,-is.y,is.x,0];return!Rl(e,bs,Es,Ts,ca)||(e=[1,0,0,0,1,0,0,0,1],!Rl(e,bs,Es,Ts,ca))?!1:(ha.crossVectors(Fi,Oi),e=[ha.x,ha.y,ha.z],Rl(e,bs,Es,Ts,ca))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,jn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(jn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Mi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Mi=[new I,new I,new I,new I,new I,new I,new I,new I],jn=new I,la=new Je,bs=new I,Es=new I,Ts=new I,Fi=new I,Oi=new I,is=new I,fr=new I,ca=new I,ha=new I,ss=new I;function Rl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ss.fromArray(i,r);let o=s.x*Math.abs(ss.x)+s.y*Math.abs(ss.y)+s.z*Math.abs(ss.z),l=t.dot(ss),c=e.dot(ss),u=n.dot(ss);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Ze=new I,ua=new Ft,_d=0,ke=class extends ei{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_d++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=mc,this.updateRanges=[],this.gpuType=Wn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)ua.fromBufferAttribute(this,e),ua.applyMatrix3(t),this.setXY(e,ua.x,ua.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyMatrix3(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyMatrix4(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyNormalMatrix(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.transformDirection(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Qn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ie(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Qn(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ie(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Qn(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ie(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Qn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ie(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Qn(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ie(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array),s=Ie(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array),s=Ie(s,this.array),r=Ie(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Pr=class extends ke{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Ir=class extends ke{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var De=class extends ke{constructor(t,e,n){super(new Float32Array(t),e,n)}},xd=new Je,pr=new I,Cl=new I,wi=class{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):xd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;pr.subVectors(t,this.center);let e=pr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(pr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Cl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(pr.copy(t.center).add(Cl)),this.expandByPoint(pr.copy(t.center).sub(Cl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},yd=0,Gn=new Ee,Pl=new je,ws=new I,Pn=new Je,mr=new Je,nn=new I,Te=class i extends ei{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yd++}),this.uuid=bi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Gu(t)?Ir:Pr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new se().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Gn.makeRotationFromQuaternion(t),this.applyMatrix4(Gn),this}rotateX(t){return Gn.makeRotationX(t),this.applyMatrix4(Gn),this}rotateY(t){return Gn.makeRotationY(t),this.applyMatrix4(Gn),this}rotateZ(t){return Gn.makeRotationZ(t),this.applyMatrix4(Gn),this}translate(t,e,n){return Gn.makeTranslation(t,e,n),this.applyMatrix4(Gn),this}scale(t,e,n){return Gn.makeScale(t,e,n),this.applyMatrix4(Gn),this}lookAt(t){return Pl.lookAt(t),Pl.updateMatrix(),this.applyMatrix4(Pl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ws).negate(),this.translate(ws.x,ws.y,ws.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new De(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&$t("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Je);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Pn.setFromBufferAttribute(r),this.morphTargetsRelative?(nn.addVectors(this.boundingBox.min,Pn.min),this.boundingBox.expandByPoint(nn),nn.addVectors(this.boundingBox.max,Pn.max),this.boundingBox.expandByPoint(nn)):(this.boundingBox.expandByPoint(Pn.min),this.boundingBox.expandByPoint(Pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){let n=this.boundingSphere.center;if(Pn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];mr.setFromBufferAttribute(o),this.morphTargetsRelative?(nn.addVectors(Pn.min,mr.min),Pn.expandByPoint(nn),nn.addVectors(Pn.max,mr.max),Pn.expandByPoint(nn)):(Pn.expandByPoint(mr.min),Pn.expandByPoint(mr.max))}Pn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)nn.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(nn));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)nn.fromBufferAttribute(o,c),l&&(ws.fromBufferAttribute(t,c),nn.add(ws)),s=Math.max(s,n.distanceToSquared(nn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Qt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ke(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new I,l[_]=new I;let c=new I,u=new I,f=new I,h=new Ft,m=new Ft,x=new Ft,S=new I,p=new I;function d(_,E,L){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,E),f.fromBufferAttribute(n,L),h.fromBufferAttribute(r,_),m.fromBufferAttribute(r,E),x.fromBufferAttribute(r,L),u.sub(c),f.sub(c),m.sub(h),x.sub(h);let z=1/(m.x*x.y-x.x*m.y);isFinite(z)&&(S.copy(u).multiplyScalar(x.y).addScaledVector(f,-m.y).multiplyScalar(z),p.copy(f).multiplyScalar(m.x).addScaledVector(u,-x.x).multiplyScalar(z),o[_].add(S),o[E].add(S),o[L].add(S),l[_].add(p),l[E].add(p),l[L].add(p))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let _=0,E=w.length;_<E;++_){let L=w[_],z=L.start,H=L.count;for(let G=z,U=z+H;G<U;G+=3)d(t.getX(G+0),t.getX(G+1),t.getX(G+2))}let D=new I,M=new I,b=new I,T=new I;function P(_){b.fromBufferAttribute(s,_),T.copy(b);let E=o[_];D.copy(E),D.sub(b.multiplyScalar(b.dot(E))).normalize(),M.crossVectors(T,E);let z=M.dot(l[_])<0?-1:1;a.setXYZW(_,D.x,D.y,D.z,z)}for(let _=0,E=w.length;_<E;++_){let L=w[_],z=L.start,H=L.count;for(let G=z,U=z+H;G<U;G+=3)P(t.getX(G+0)),P(t.getX(G+1)),P(t.getX(G+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ke(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,m=n.count;h<m;h++)n.setXYZ(h,0,0,0);let s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,u=new I,f=new I;if(t)for(let h=0,m=t.count;h<m;h+=3){let x=t.getX(h+0),S=t.getX(h+1),p=t.getX(h+2);s.fromBufferAttribute(e,x),r.fromBufferAttribute(e,S),a.fromBufferAttribute(e,p),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,S),c.fromBufferAttribute(n,p),o.add(u),l.add(u),c.add(u),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(S,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,m=e.count;h<m;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)nn.fromBufferAttribute(t,e),nn.normalize(),t.setXYZ(e,nn.x,nn.y,nn.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,f=o.normalized,h=new c.constructor(l.length*u),m=0,x=0;for(let S=0,p=l.length;S<p;S++){o.isInterleavedBufferAttribute?m=l[S]*o.data.stride+o.offset:m=l[S]*u;for(let d=0;d<u;d++)h[x++]=c[m++]}return new ke(h,u,f)}if(this.index===null)return $t("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,f=c.length;u<f;u++){let h=c[u],m=t(h,n);l.push(m)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let m=c[f];u.push(m.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,m=f.length;h<m;h++)u.push(f[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Lr=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=mc,this.updateRanges=[],this.version=0,this.uuid=bi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=bi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=bi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},mn=new I,Ws=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)mn.fromBufferAttribute(this,e),mn.applyMatrix4(t),this.setXYZ(e,mn.x,mn.y,mn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)mn.fromBufferAttribute(this,e),mn.applyNormalMatrix(t),this.setXYZ(e,mn.x,mn.y,mn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)mn.fromBufferAttribute(this,e),mn.transformDirection(t),this.setXYZ(e,mn.x,mn.y,mn.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Qn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ie(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Ie(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Qn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Qn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Qn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Qn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array),s=Ie(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ie(e,this.array),n=Ie(n,this.array),s=Ie(s,this.array),r=Ie(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Ar("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ke(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Ar("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Il=new I,vd=new I,Md=new se,In=class{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Il.subVectors(n,e).cross(vd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(Il),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Md.getNormalMatrix(t),s=this.coplanarPoint(Il).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Sd=0,fi=class extends ei{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=bi(),this.name="",this.type="Material",this.blending=nr,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jl,this.blendDst=Ql,this.blendEquation=ds,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=Os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ua,this.stencilZFail=Ua,this.stencilZPass=Ua,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){$t(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){$t(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ot().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new In().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ft().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ft().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},ls=class extends fi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ot(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},As,gr=new I,Rs=new I,Cs=new I,Ps=new Ft,_r=new Ft,su=new Ee,da=new I,xr=new I,fa=new I,th=new Ft,Ll=new Ft,eh=new Ft,Xs=class extends je{constructor(t=new ls){if(super(),this.isSprite=!0,this.type="Sprite",As===void 0){As=new Te;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Lr(e,5);As.setIndex([0,1,2,0,2,3]),As.setAttribute("position",new Ws(n,3,0,!1)),As.setAttribute("uv",new Ws(n,2,3,!1))}this.geometry=As,this.material=t,this.center=new Ft(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&Qt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Rs.setFromMatrixScale(this.matrixWorld),su.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Cs.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Rs.multiplyScalar(-Cs.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;pa(da.set(-.5,-.5,0),Cs,a,Rs,s,r),pa(xr.set(.5,-.5,0),Cs,a,Rs,s,r),pa(fa.set(.5,.5,0),Cs,a,Rs,s,r),th.set(0,0),Ll.set(1,0),eh.set(1,1);let o=t.ray.intersectTriangle(da,xr,fa,!1,gr);if(o===null&&(pa(xr.set(-.5,.5,0),Cs,a,Rs,s,r),Ll.set(0,1),o=t.ray.intersectTriangle(da,fa,xr,!1,gr),o===null))return;let l=t.ray.origin.distanceTo(gr);l<t.near||l>t.far||e.push({distance:l,point:gr.clone(),uv:hi.getInterpolation(gr,da,xr,fa,th,Ll,eh,new Ft),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function pa(i,t,e,n,s,r){Ps.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(_r.x=r*Ps.x-s*Ps.y,_r.y=s*Ps.x+r*Ps.y):_r.copy(Ps),i.copy(t),i.x+=_r.x,i.y+=_r.y,i.applyMatrix4(su)}var Si=new I,Dl=new I,ma=new I,ga=new I,zi=class{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Si)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Si.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Si.copy(this.origin).addScaledVector(this.direction,e),Si.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Dl.copy(t).add(e).multiplyScalar(.5),ma.copy(e).sub(t).normalize(),ga.copy(this.origin).sub(Dl);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ma),o=ga.dot(this.direction),l=-ga.dot(ma),c=ga.lengthSq(),u=Math.abs(1-a*a),f,h,m,x;if(u>0)if(f=a*l-o,h=a*o-l,x=r*u,f>=0)if(h>=-x)if(h<=x){let S=1/u;f*=S,h*=S,m=f*(f+a*h+2*o)+h*(a*f+h+2*l)+c}else h=r,f=Math.max(0,-(a*h+o)),m=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(a*h+o)),m=-f*f+h*(h+2*l)+c;else h<=-x?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c):h<=x?(f=0,h=Math.min(Math.max(-r,-l),r),m=h*(h+2*l)+c):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),m=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Dl).addScaledVector(ma,h),m}intersectSphere(t,e){if(t.radius<0)return null;Si.subVectors(t.center,this.origin);let n=Si.dot(this.direction),s=Si.dot(Si)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-h.z)*f,l=(t.max.z-h.z)*f):(o=(t.max.z-h.z)*f,l=(t.min.z-h.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Si)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,f=t.x-a.x,h=t.y-a.y,m=t.z-a.z,x=e.x-a.x,S=e.y-a.y,p=e.z-a.z,d=n.x-a.x,w=n.y-a.y,D=n.z-a.z,M=Math.abs(l),b=Math.abs(c),T=Math.abs(u),P,_,E,L,z,H,G,U,Z,Y,nt,j;if(M>=b&&M>=T?(E=l,H=f,Z=x,j=d,l>=0?(P=c,_=u,L=h,z=m,G=S,U=p,Y=w,nt=D):(P=u,_=c,L=m,z=h,G=p,U=S,Y=D,nt=w)):b>=T?(E=c,H=h,Z=S,j=w,c>=0?(P=u,_=l,L=m,z=f,G=p,U=x,Y=D,nt=d):(P=l,_=u,L=f,z=m,G=x,U=p,Y=d,nt=D)):(E=u,H=m,Z=p,j=D,u>=0?(P=l,_=c,L=f,z=h,G=x,U=S,Y=d,nt=w):(P=c,_=l,L=h,z=f,G=S,U=x,Y=w,nt=d)),E===0)return null;let $=P/E,st=_/E,W=1/E,Nt=L-$*H,ct=z-st*H,ve=G-$*Z,ge=U-st*Z,zt=Y-$*j,ot=nt-st*j,pt=zt*ge-ot*ve,Bt=Nt*ot-ct*zt,te=ve*ct-ge*Nt;if(s){if(pt<0||Bt<0||te<0)return null}else if((pt<0||Bt<0||te<0)&&(pt>0||Bt>0||te>0))return null;let At=pt+Bt+te;if(At===0)return null;let ee=W*(pt*H+Bt*Z+te*j);return(At>0?ee<0:ee>0)?null:this.at(ee/At,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rn=class extends fi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ti,this.combine=tc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},nh=new Ee,rs=new zi,_a=new wi,ih=new I,xa=new I,ya=new I,va=new I,Nl=new I,Ma=new I,sh=new I,Sa=new I,de=class extends je{constructor(t=new Te,e=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Ma.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],f=r[l];u!==0&&(Nl.fromBufferAttribute(f,t),a?Ma.addScaledVector(Nl,u):Ma.addScaledVector(Nl.sub(e),u))}e.add(Ma)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(r),rs.copy(t.ray).recast(t.near),!(_a.containsPoint(rs.origin)===!1&&(rs.intersectSphere(_a,ih)===null||rs.origin.distanceToSquared(ih)>(t.far-t.near)**2))&&(nh.copy(r).invert(),rs.copy(t.ray).applyMatrix4(nh),!(n.boundingBox!==null&&rs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,rs)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,S=h.length;x<S;x++){let p=h[x],d=a[p.materialIndex],w=Math.max(p.start,m.start),D=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let M=w,b=D;M<b;M+=3){let T=o.getX(M),P=o.getX(M+1),_=o.getX(M+2);s=ba(this,d,t,n,c,u,f,T,P,_),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let x=Math.max(0,m.start),S=Math.min(o.count,m.start+m.count);for(let p=x,d=S;p<d;p+=3){let w=o.getX(p),D=o.getX(p+1),M=o.getX(p+2);s=ba(this,a,t,n,c,u,f,w,D,M),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,S=h.length;x<S;x++){let p=h[x],d=a[p.materialIndex],w=Math.max(p.start,m.start),D=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let M=w,b=D;M<b;M+=3){let T=M,P=M+1,_=M+2;s=ba(this,d,t,n,c,u,f,T,P,_),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let x=Math.max(0,m.start),S=Math.min(l.count,m.start+m.count);for(let p=x,d=S;p<d;p+=3){let w=p,D=p+1,M=p+2;s=ba(this,a,t,n,c,u,f,w,D,M),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function bd(i,t,e,n,s,r,a,o){let l;if(t.side===an?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===pi,o),l===null)return null;Sa.copy(o),Sa.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Sa);return c<e.near||c>e.far?null:{distance:c,point:Sa.clone(),object:i}}function ba(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,xa),i.getVertexPosition(l,ya),i.getVertexPosition(c,va);let u=bd(i,t,e,n,xa,ya,va,sh);if(u){let f=new I;hi.getBarycoord(sh,xa,ya,va,f),s&&(u.uv=hi.getInterpolatedAttribute(s,o,l,c,f,new Ft)),r&&(u.uv1=hi.getInterpolatedAttribute(r,o,l,c,f,new Ft)),a&&(u.normal=hi.getInterpolatedAttribute(a,o,l,c,f,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new I,materialIndex:0};hi.getNormal(xa,ya,va,h.normal),u.face=h,u.barycoord=f}return u}var Dr=class extends gn{constructor(t=null,e=1,n=1,s,r,a,o,l,c=sn,u=sn,f,h){super(null,a,o,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var qs=class extends ke{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Is=new Ee,rh=new Ee,Ea=[],ah=new Je,Ed=new Ee,yr=new de,vr=new wi,Ys=class extends de{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new qs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ed)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Je),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Is),ah.copy(t.boundingBox).applyMatrix4(Is),this.boundingBox.union(ah)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new wi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Is),vr.copy(t.boundingSphere).applyMatrix4(Is),this.boundingSphere.union(vr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(yr.geometry=this.geometry,yr.material=this.material,yr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vr.copy(this.boundingSphere),vr.applyMatrix4(n),t.ray.intersectsSphere(vr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Is),rh.multiplyMatrices(n,Is),yr.matrixWorld=rh,yr.raycast(t,Ea);for(let a=0,o=Ea.length;a<o;a++){let l=Ea[a];l.instanceId=r,l.object=this,e.push(l)}Ea.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new qs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Dr(new Float32Array(s*this.count),s,this.count,Mo,Wn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},as=new wi,Td=new Ft(.5,.5),Ta=new I,Zs=class{constructor(t=new In,e=new In,n=new In,s=new In,r=new In,a=new In){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=ti,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],m=r[7],x=r[8],S=r[9],p=r[10],d=r[11],w=r[12],D=r[13],M=r[14],b=r[15];if(s[0].setComponents(c-a,m-u,d-x,b-w).normalize(),s[1].setComponents(c+a,m+u,d+x,b+w).normalize(),s[2].setComponents(c+o,m+f,d+S,b+D).normalize(),s[3].setComponents(c-o,m-f,d-S,b-D).normalize(),n)s[4].setComponents(l,h,p,M).normalize(),s[5].setComponents(c-l,m-h,d-p,b-M).normalize();else if(s[4].setComponents(c-l,m-h,d-p,b-M).normalize(),e===ti)s[5].setComponents(c+l,m+h,d+p,b+M).normalize();else if(e===Bs)s[5].setComponents(l,h,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),as.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),as.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(as)}intersectsSprite(t){as.center.set(0,0,0);let e=Td.distanceTo(t.center);return as.radius=.7071067811865476+e,as.applyMatrix4(t.matrixWorld),this.intersectsSphere(as)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ta.x=s.normal.x>0?t.max.x:t.min.x,Ta.y=s.normal.y>0?t.max.y:t.min.y,Ta.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ta)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Mn=class extends fi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ot(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Ja=new I,Ka=new I,oh=new Ee,Mr=new zi,wa=new wi,Ul=new I,lh=new I,Dn=class extends je{constructor(t=new Te,e=new Mn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Ja.fromBufferAttribute(e,s-1),Ka.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Ja.distanceTo(Ka);t.setAttribute("lineDistance",new De(n,1))}else $t("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),wa.copy(n.boundingSphere),wa.applyMatrix4(s),wa.radius+=r,t.ray.intersectsSphere(wa)===!1)return;oh.copy(s).invert(),Mr.copy(t.ray).applyMatrix4(oh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let m=Math.max(0,a.start),x=Math.min(u.count,a.start+a.count);for(let S=m,p=x-1;S<p;S+=c){let d=u.getX(S),w=u.getX(S+1),D=Aa(this,t,Mr,l,d,w,S);D&&e.push(D)}if(this.isLineLoop){let S=u.getX(x-1),p=u.getX(m),d=Aa(this,t,Mr,l,S,p,x-1);d&&e.push(d)}}else{let m=Math.max(0,a.start),x=Math.min(h.count,a.start+a.count);for(let S=m,p=x-1;S<p;S+=c){let d=Aa(this,t,Mr,l,S,S+1,S);d&&e.push(d)}if(this.isLineLoop){let S=Aa(this,t,Mr,l,x-1,m,x-1);S&&e.push(S)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Aa(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(Ja.fromBufferAttribute(o,s),Ka.fromBufferAttribute(o,r),e.distanceSqToSegment(Ja,Ka,Ul,lh)>n)return;Ul.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ul);if(!(c<t.near||c>t.far))return{distance:c,point:lh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var ch=new I,hh=new I,Ai=class extends Dn{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)ch.fromBufferAttribute(e,s),hh.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+ch.distanceTo(hh);t.setAttribute("lineDistance",new De(n,1))}else $t("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Js=class extends Dn{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}};var Nr=class extends gn{constructor(t=[],e=Zi,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Ks=class extends gn{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ki=class extends gn{constructor(t,e,n=ii,s,r,a,o=sn,l=sn,c,u=di,f=1){if(u!==di&&u!==Ki)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:f};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Hs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},$a=class extends ki{constructor(t,e=ii,n=Zi,s,r,a=sn,o=sn,l,c=di){let u={width:t,height:t,depth:1},f=[u,u,u,u,u,u];super(t,t,e,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Ur=class extends gn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Nn=class i extends Te{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],f=[],h=0,m=0;x("z","y","x",-1,-1,n,e,t,a,r,0),x("z","y","x",1,-1,n,e,-t,a,r,1),x("x","z","y",1,1,t,n,e,s,a,2),x("x","z","y",1,-1,t,n,-e,s,a,3),x("x","y","z",1,-1,t,e,n,s,r,4),x("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new De(c,3)),this.setAttribute("normal",new De(u,3)),this.setAttribute("uv",new De(f,2));function x(S,p,d,w,D,M,b,T,P,_,E){let L=M/P,z=b/_,H=M/2,G=b/2,U=T/2,Z=P+1,Y=_+1,nt=0,j=0,$=new I;for(let st=0;st<Y;st++){let W=st*z-G;for(let Nt=0;Nt<Z;Nt++){let ct=Nt*L-H;$[S]=ct*w,$[p]=W*D,$[d]=U,c.push($.x,$.y,$.z),$[S]=0,$[p]=0,$[d]=T>0?1:-1,u.push($.x,$.y,$.z),f.push(Nt/P),f.push(1-st/_),nt+=1}}for(let st=0;st<_;st++)for(let W=0;W<P;W++){let Nt=h+W+Z*st,ct=h+W+Z*(st+1),ve=h+(W+1)+Z*(st+1),ge=h+(W+1)+Z*st;l.push(Nt,ct,ge),l.push(ct,ve,ge),j+=6}o.addGroup(m,j,E),m+=j,h+=nt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var _n=class i extends Te{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],h=[],m=[],x=0,S=[],p=n/2,d=0;w(),a===!1&&(t>0&&D(!0),e>0&&D(!1)),this.setIndex(u),this.setAttribute("position",new De(f,3)),this.setAttribute("normal",new De(h,3)),this.setAttribute("uv",new De(m,2));function w(){let M=new I,b=new I,T=0,P=(e-t)/n;for(let _=0;_<=r;_++){let E=[],L=_/r,z=L*(e-t)+t;for(let H=0;H<=s;H++){let G=H/s,U=G*l+o,Z=Math.sin(U),Y=Math.cos(U);b.x=z*Z,b.y=-L*n+p,b.z=z*Y,f.push(b.x,b.y,b.z),M.set(Z,P,Y).normalize(),h.push(M.x,M.y,M.z),m.push(G,1-L),E.push(x++)}S.push(E)}for(let _=0;_<s;_++)for(let E=0;E<r;E++){let L=S[E][_],z=S[E+1][_],H=S[E+1][_+1],G=S[E][_+1];(t>0||E!==0)&&(u.push(L,z,G),T+=3),(e>0||E!==r-1)&&(u.push(z,H,G),T+=3)}c.addGroup(d,T,0),d+=T}function D(M){let b=x,T=new Ft,P=new I,_=0,E=M===!0?t:e,L=M===!0?1:-1;for(let H=1;H<=s;H++)f.push(0,p*L,0),h.push(0,L,0),m.push(.5,.5),x++;let z=x;for(let H=0;H<=s;H++){let U=H/s*l+o,Z=Math.cos(U),Y=Math.sin(U);P.x=E*Y,P.y=p*L,P.z=E*Z,f.push(P.x,P.y,P.z),h.push(0,L,0),T.x=Z*.5+.5,T.y=Y*.5*L+.5,m.push(T.x,T.y),x++}for(let H=0;H<s;H++){let G=b+H,U=z+H;M===!0?u.push(U,U+1,G):u.push(U+1,U,G),_+=3}c.addGroup(d,_,M===!0?1:2),d+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},cs=class i extends _n{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Ra=new I,Ca=new I,Fl=new I,Pa=new hi,$s=class extends Te{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){let s=Math.pow(10,4),r=Math.cos(Us*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],u=["a","b","c"],f=new Array(3),h={},m=[];for(let x=0;x<l;x+=3){a?(c[0]=a.getX(x),c[1]=a.getX(x+1),c[2]=a.getX(x+2)):(c[0]=x,c[1]=x+1,c[2]=x+2);let{a:S,b:p,c:d}=Pa;if(S.fromBufferAttribute(o,c[0]),p.fromBufferAttribute(o,c[1]),d.fromBufferAttribute(o,c[2]),Pa.getNormal(Fl),f[0]=`${Math.round(S.x*s)},${Math.round(S.y*s)},${Math.round(S.z*s)}`,f[1]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,f[2]=`${Math.round(d.x*s)},${Math.round(d.y*s)},${Math.round(d.z*s)}`,!(f[0]===f[1]||f[1]===f[2]||f[2]===f[0]))for(let w=0;w<3;w++){let D=(w+1)%3,M=f[w],b=f[D],T=Pa[u[w]],P=Pa[u[D]],_=`${M}_${b}`,E=`${b}_${M}`;E in h&&h[E]?(Fl.dot(h[E].normal)<=r&&(m.push(T.x,T.y,T.z),m.push(P.x,P.y,P.z)),h[E]=null):_ in h||(h[_]={index0:c[w],index1:c[D],normal:Fl.clone()})}}for(let x in h)if(h[x]){let{index0:S,index1:p}=h[x];Ra.fromBufferAttribute(o,S),Ca.fromBufferAttribute(o,p),m.push(Ra.x,Ra.y,Ra.z),m.push(Ca.x,Ca.y,Ca.z)}this.setAttribute("position",new De(m,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};var Fr=class i extends Te{constructor(t=[new Ft(0,-.5),new Ft(.5,0),new Ft(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=me(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],u=1/e,f=new I,h=new Ft,m=new I,x=new I,S=new I,p=0,d=0;for(let w=0;w<=t.length-1;w++)switch(w){case 0:p=t[w+1].x-t[w].x,d=t[w+1].y-t[w].y,m.x=d*1,m.y=-p,m.z=d*0,S.copy(m),m.normalize(),l.push(m.x,m.y,m.z);break;case t.length-1:l.push(S.x,S.y,S.z);break;default:p=t[w+1].x-t[w].x,d=t[w+1].y-t[w].y,m.x=d*1,m.y=-p,m.z=d*0,x.copy(m),m.x+=S.x,m.y+=S.y,m.z+=S.z,m.normalize(),l.push(m.x,m.y,m.z),S.copy(x)}for(let w=0;w<=e;w++){let D=n+w*u*s,M=Math.sin(D),b=Math.cos(D);for(let T=0;T<=t.length-1;T++){f.x=t[T].x*M,f.y=t[T].y,f.z=t[T].x*b,a.push(f.x,f.y,f.z),h.x=w/e,h.y=T/(t.length-1),o.push(h.x,h.y);let P=l[3*T+0]*M,_=l[3*T+1],E=l[3*T+0]*b;c.push(P,_,E)}}for(let w=0;w<e;w++)for(let D=0;D<t.length-1;D++){let M=D+w*t.length,b=M,T=M+t.length,P=M+t.length+1,_=M+1;r.push(b,T,_),r.push(P,_,T)}this.setIndex(r),this.setAttribute("position",new De(a,3)),this.setAttribute("uv",new De(o,2)),this.setAttribute("normal",new De(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var hs=class i extends Te{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,f=t/o,h=e/l,m=[],x=[],S=[],p=[];for(let d=0;d<u;d++){let w=d*h-a;for(let D=0;D<c;D++){let M=D*f-r;x.push(M,-w,0),S.push(0,0,1),p.push(D/o),p.push(1-d/l)}}for(let d=0;d<l;d++)for(let w=0;w<o;w++){let D=w+c*d,M=w+c*(d+1),b=w+1+c*(d+1),T=w+1+c*d;m.push(D,M,T),m.push(M,b,T)}this.setIndex(m),this.setAttribute("position",new De(x,3)),this.setAttribute("normal",new De(S,3)),this.setAttribute("uv",new De(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var Hi=class i extends Te{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],f=new I,h=new I,m=[],x=[],S=[],p=[];for(let d=0;d<=n;d++){let w=[],D=d/n,M=a+D*o,b=t*Math.cos(M),T=Math.sqrt(t*t-b*b),P=0;d===0&&a===0?P=.5/e:d===n&&l===Math.PI&&(P=-.5/e);for(let _=0;_<=e;_++){let E=_/e,L=s+E*r;f.x=-T*Math.cos(L),f.y=b,f.z=T*Math.sin(L),x.push(f.x,f.y,f.z),h.copy(f).normalize(),S.push(h.x,h.y,h.z),p.push(E+P,1-D),w.push(c++)}u.push(w)}for(let d=0;d<n;d++)for(let w=0;w<e;w++){let D=u[d][w+1],M=u[d][w],b=u[d+1][w],T=u[d+1][w+1];(d!==0||a>0)&&m.push(D,M,T),(d!==n-1||l<Math.PI)&&m.push(M,b,T)}this.setIndex(m),this.setAttribute("position",new De(x,3)),this.setAttribute("normal",new De(S,3)),this.setAttribute("uv",new De(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function ps(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(uh(s))s.isRenderTargetTexture?($t("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(uh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function pn(i){let t={};for(let e=0;e<i.length;e++){let n=ps(i[e]);for(let s in n)t[s]=n[s]}return t}function uh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function wd(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function yc(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:_e.workingColorSpace}var ru={clone:ps,merge:pn},Ad=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Rd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Un=class extends fi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ad,this.fragmentShader=Rd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ps(t.uniforms),this.uniformsGroups=wd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Ot().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ft().fromArray(s.value);break;case"v3":this.uniforms[n].value=new I().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new se().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Ee().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},ja=class extends Un{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ve=class extends fi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=el,this.normalScale=new Ft(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ti,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Qa=class extends fi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},to=class extends fi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};var Ri=class extends Mn{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function Ls(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Ol(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Vi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},eo=class extends Vi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Hl,endingEnd:Hl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Vl:r=t,o=2*e-n;break;case Gl:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Vl:a=t,l=2*n-e;break;case Gl:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,m=this._weightNext,x=(n-e)/(s-e),S=x*x,p=S*x,d=-h*p+2*h*S-h*x,w=(1+h)*p+(-1.5-2*h)*S+(-.5+h)*x+1,D=(-1-m)*p+(1.5+m)*S+.5*x,M=m*p-m*S;for(let b=0;b!==o;++b)r[b]=d*a[u+b]+w*a[c+b]+D*a[l+b]+M*a[f+b];return r}},no=class extends Vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(n-e)/(s-e),f=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*f+a[l+h]*u;return r}},io=class extends Vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},so=class extends Vi{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let x=(n-e)/(s-e),S=1-x;for(let p=0;p!==o;++p)r[p]=a[c+p]*S+a[l+p]*x;return r}let h=o*2,m=t-1;for(let x=0;x!==o;++x){let S=a[c+x],p=a[l+x],d=m*h+x*2,w=f[d],D=f[d+1],M=t*h+x*2,b=u[M],T=u[M+1],P=Pd(n,e,w,b,s);r[x]=au(P,S,D,T,p)}return r}};function au(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Cd(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Pd(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=au(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Cd(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Fn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ls(e,this.TimeBufferType),this.values=Ls(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Ls(t.times,Array),values:Ls(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Ol(t.settings)&&(n.settings={inTangents:Ls(t.settings.inTangents,Array),outTangents:Ls(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new io(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new no(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new eo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new so(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case br:e=this.InterpolantFactoryMethodDiscrete;break;case Xa:e=this.InterpolantFactoryMethodLinear;break;case Na:e=this.InterpolantFactoryMethodSmooth;break;case kl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return $t("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return br;case this.InterpolantFactoryMethodLinear:return Xa;case this.InterpolantFactoryMethodSmooth:return Na;case this.InterpolantFactoryMethodBezier:return kl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Ol(this.settings)&&(dh(this.settings.inTangents,t),dh(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Qt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Qt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Qt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Qt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Wu(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Qt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Na,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(s)l=!0;else{let f=o*n,h=f-n,m=f+n;for(let x=0;x!==n;++x){let S=e[f+x];if(S!==e[h+x]||S!==e[m+x]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let f=o*n,h=a*n;for(let m=0;m!==n;++m)e[h+m]=e[f+m]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Ol(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function dh(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}Fn.prototype.ValueTypeName="";Fn.prototype.TimeBufferType=Float32Array;Fn.prototype.ValueBufferType=Float32Array;Fn.prototype.DefaultInterpolation=Xa;var Gi=class extends Fn{constructor(t,e,n){super(t,e,n)}};Gi.prototype.ValueTypeName="bool";Gi.prototype.ValueBufferType=Array;Gi.prototype.DefaultInterpolation=br;Gi.prototype.InterpolantFactoryMethodLinear=void 0;Gi.prototype.InterpolantFactoryMethodSmooth=void 0;var ro=class extends Fn{constructor(t,e,n,s){super(t,e,n,s)}};ro.prototype.ValueTypeName="color";var ao=class extends Fn{constructor(t,e,n,s){super(t,e,n,s)}};ao.prototype.ValueTypeName="number";var oo=class extends Vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let u=c+o;c!==u;c+=4)Ln.slerpFlat(r,0,a,c-o,a,c,l);return r}},Or=class extends Fn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new oo(this.times,this.values,this.getValueSize(),t)}};Or.prototype.ValueTypeName="quaternion";Or.prototype.InterpolantFactoryMethodSmooth=void 0;var Wi=class extends Fn{constructor(t,e,n){super(t,e,n)}};Wi.prototype.ValueTypeName="string";Wi.prototype.ValueBufferType=Array;Wi.prototype.DefaultInterpolation=br;Wi.prototype.InterpolantFactoryMethodLinear=void 0;Wi.prototype.InterpolantFactoryMethodSmooth=void 0;var lo=class extends Fn{constructor(t,e,n,s){super(t,e,n,s)}};lo.prototype.ValueTypeName="vector";var co=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let m=c[f],x=c[f+1];if(m.global&&(m.lastIndex=0),m.test(u))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},ou=new co,ho=class{constructor(t){this.manager=t!==void 0?t:ou,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ho.DEFAULT_MATERIAL_NAME="__DEFAULT";var Br=class extends je{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},zr=class extends Br{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(je.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ot(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Bl=new Ee,fh=new I,ph=new I,uo=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ft(512,512),this.mapType=Sn,this.map=null,this.mapPass=null,this.matrix=new Ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Zs,this._frameExtents=new Ft(1,1),this._viewportCount=1,this._viewports=[new Oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;fh.setFromMatrixPosition(t.matrixWorld),e.position.copy(fh),ph.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ph),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Bl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Bl,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===Bs||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Bl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ia=new I,La=new Ln,ci=new I,kr=class extends je{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ee,this.projectionMatrix=new Ee,this.projectionMatrixInverse=new Ee,this.coordinateSystem=ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ia,La,ci),ci.x===1&&ci.y===1&&ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ia,La,ci.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Ia,La,ci),ci.x===1&&ci.y===1&&ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ia,La,ci.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Bi=new I,mh=new Ft,gh=new Ft,fn=class extends kr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ks*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Us*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ks*2*Math.atan(Math.tan(Us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Bi.x,Bi.y).multiplyScalar(-t/Bi.z),Bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bi.x,Bi.y).multiplyScalar(-t/Bi.z)}getViewSize(t,e){return this.getViewBounds(t,mh,gh),e.subVectors(gh,mh)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Us*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var js=class extends kr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Wl=class extends uo{constructor(){super(new js(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Xi=class extends Br{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(je.DEFAULT_UP),this.updateMatrix(),this.target=new je,this.shadow=new Wl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ds=-90,Ns=1,fo=class extends je{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new fn(Ds,Ns,t,e);s.layers=this.layers,this.add(s);let r=new fn(Ds,Ns,t,e);r.layers=this.layers,this.add(r);let a=new fn(Ds,Ns,t,e);a.layers=this.layers,this.add(a);let o=new fn(Ds,Ns,t,e);o.layers=this.layers,this.add(o);let l=new fn(Ds,Ns,t,e);l.layers=this.layers,this.add(l);let c=new fn(Ds,Ns,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===ti)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Bs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,f=t.getRenderTarget(),h=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),x=t.xr.enabled;t.xr.enabled=!1;let S=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=S,t.setRenderTarget(n,5,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(f,h,m),t.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},po=class extends fn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var vc="\\[\\]\\.:\\/",Id=new RegExp("["+vc+"]","g"),Mc="[^"+vc+"]",Ld="[^"+vc.replace("\\.","")+"]",Dd=/((?:WC+[\/:])*)/.source.replace("WC",Mc),Nd=/(WCOD+)?/.source.replace("WCOD",Ld),Ud=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Mc),Fd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Mc),Od=new RegExp("^"+Dd+Nd+Ud+Fd+"$"),Bd=["material","materials","bones","map"],Xl=class{constructor(t,e,n){let s=n||Fe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Fe=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Id,"")}static parseTrackName(t){let e=Od.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Bd.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){$t("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Qt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Qt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Qt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Qt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Qt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Qt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Qt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Qt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Qt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Qt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Fe.Composite=Xl;Fe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Fe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Fe.prototype.GetterByBindingType=[Fe.prototype._getValue_direct,Fe.prototype._getValue_array,Fe.prototype._getValue_arrayElement,Fe.prototype._getValue_toArray];Fe.prototype.SetterByBindingTypeAndVersioning=[[Fe.prototype._setValue_direct,Fe.prototype._setValue_direct_setNeedsUpdate,Fe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Fe.prototype._setValue_array,Fe.prototype._setValue_array_setNeedsUpdate,Fe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Fe.prototype._setValue_arrayElement,Fe.prototype._setValue_arrayElement_setNeedsUpdate,Fe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Fe.prototype._setValue_fromArray,Fe.prototype._setValue_fromArray_setNeedsUpdate,Fe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Z0=new Float32Array(1);var _h=new Ee,Ci=class{constructor(t,e,n=0,s=1/0){this.ray=new zi(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Vs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Qt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return _h.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(_h),this}intersectObject(t,e=!0,n=[]){return ql(t,this,n,e),n.sort(xh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)ql(t[s],this,n,e);return n.sort(xh),n}};function xh(i,t){return i.distance-t.distance}function ql(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)ql(r[a],t,e,!0)}}var Qs=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=me(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(me(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Yl=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};var yh=new I,Da,zl,tr=class extends je{constructor(t=new I(0,0,1),e=new I(0,0,0),n=1,s=16776960,r=n*.2,a=r*.2){super(),this.type="ArrowHelper",Da===void 0&&(Da=new Te,Da.setAttribute("position",new De([0,0,0,0,1,0],3)),zl=new cs(.5,1,5,1),zl.translate(0,-.5,0)),this.position.copy(e),this.line=new Dn(Da,new Mn({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new de(zl,new rn({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(t),this.setLength(n,r,a)}setDirection(t){if(t.y>.99999)this.quaternion.set(0,0,0,1);else if(t.y<-.99999)this.quaternion.set(1,0,0,0);else{yh.set(t.z,0,-t.x).normalize();let e=Math.acos(t.y);this.quaternion.setFromAxisAngle(yh,e)}}setLength(t,e=t*.2,n=e*.2){this.line.scale.set(1,Math.max(1e-4,t-e),1),this.line.updateMatrix(),this.cone.scale.set(n,e,n),this.cone.position.y=t,this.cone.updateMatrix()}setColor(t){this.line.material.color.set(t),this.cone.material.color.set(t)}copy(t){return super.copy(t,!1),this.line.copy(t.line),this.cone.copy(t.cone),this}dispose(){super.dispose(),this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}};var Hr=class extends ei{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Sc(i,t,e,n){let s=zd(n);switch(e){case fc:return i*t;case Mo:return i*t/s.components*s.byteLength;case So:return i*t/s.components*s.byteLength;case $i:return i*t*2/s.components*s.byteLength;case bo:return i*t*2/s.components*s.byteLength;case pc:return i*t*3/s.components*s.byteLength;case Xn:return i*t*4/s.components*s.byteLength;case Eo:return i*t*4/s.components*s.byteLength;case Wr:case Xr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case qr:case Yr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case wo:case Ro:return Math.max(i,16)*Math.max(t,8)/4;case To:case Ao:return Math.max(i,8)*Math.max(t,8)/2;case Co:case Po:case Lo:case Do:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Io:case Zr:case No:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Uo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Fo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Oo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Bo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case zo:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ko:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ho:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Vo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Go:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Wo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Xo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case qo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Yo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Zo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Jo:case Ko:case $o:return Math.ceil(i/4)*Math.ceil(t/4)*16;case jo:case Qo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Jr:case tl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function zd(i){switch(i){case Sn:case cc:return{byteLength:1,components:1};case ir:case hc:case si:return{byteLength:2,components:1};case yo:case vo:return{byteLength:2,components:4};case ii:case xo:case Wn:return{byteLength:4,components:1};case uc:case dc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?$t("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Cu(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Wd(i){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,f=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let u=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,u);else{f.sort((m,x)=>m.start-x.start);let h=0;for(let m=1;m<f.length;m++){let x=f[h],S=f[m];S.start<=x.start+x.count+1?x.count=Math.max(x.count,S.start+S.count-x.start):(++h,f[h]=S)}f.length=h+1;for(let m=0,x=f.length;m<x;m++){let S=f[m];i.bufferSubData(c,S.start*u.BYTES_PER_ELEMENT,u,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Xd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,qd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Yd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Zd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Kd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$d=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,jd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,tf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ef=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,nf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,sf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,rf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,af=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,of=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,lf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,hf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,uf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,df=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ff=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,mf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,gf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,_f=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,xf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,vf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Mf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Sf="gl_FragColor = linearToOutputTexel( gl_FragColor );",bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ef=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Tf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,wf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Af=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Rf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Cf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Pf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,If=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Df=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Nf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Uf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ff=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Of=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Bf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,zf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,kf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Vf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Gf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Wf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Xf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,qf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Yf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Zf=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Jf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Kf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$f=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,jf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Qf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,np=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ip=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ap=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,op=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,cp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,up=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,dp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,mp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,gp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,_p=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,xp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Mp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Sp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ep=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Tp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,wp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ap=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Rp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Cp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Pp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Ip=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Np=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Up=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Fp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Op=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,zp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,kp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Hp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Vp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Xp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,qp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Yp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$p=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Qp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,em=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,nm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,im=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,am=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,om=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,um=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,fm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,pm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,_m=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ym=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Em=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Tm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,fe={alphahash_fragment:Xd,alphahash_pars_fragment:qd,alphamap_fragment:Yd,alphamap_pars_fragment:Zd,alphatest_fragment:Jd,alphatest_pars_fragment:Kd,aomap_fragment:$d,aomap_pars_fragment:jd,batching_pars_vertex:Qd,batching_vertex:tf,begin_vertex:ef,beginnormal_vertex:nf,bsdfs:sf,iridescence_fragment:rf,bumpmap_pars_fragment:af,clipping_planes_fragment:of,clipping_planes_pars_fragment:lf,clipping_planes_pars_vertex:cf,clipping_planes_vertex:hf,color_fragment:uf,color_pars_fragment:df,color_pars_vertex:ff,color_vertex:pf,common:mf,cube_uv_reflection_fragment:gf,defaultnormal_vertex:_f,displacementmap_pars_vertex:xf,displacementmap_vertex:yf,emissivemap_fragment:vf,emissivemap_pars_fragment:Mf,colorspace_fragment:Sf,colorspace_pars_fragment:bf,envmap_fragment:Ef,envmap_common_pars_fragment:Tf,envmap_pars_fragment:wf,envmap_pars_vertex:Af,envmap_physical_pars_fragment:Bf,envmap_vertex:Rf,fog_vertex:Cf,fog_pars_vertex:Pf,fog_fragment:If,fog_pars_fragment:Lf,gradientmap_pars_fragment:Df,lightmap_pars_fragment:Nf,lights_lambert_fragment:Uf,lights_lambert_pars_fragment:Ff,lights_pars_begin:Of,lights_toon_fragment:zf,lights_toon_pars_fragment:kf,lights_phong_fragment:Hf,lights_phong_pars_fragment:Vf,lights_physical_fragment:Gf,lights_physical_pars_fragment:Wf,lights_fragment_begin:Xf,lights_fragment_maps:qf,lights_fragment_end:Yf,lightprobes_pars_fragment:Zf,logdepthbuf_fragment:Jf,logdepthbuf_pars_fragment:Kf,logdepthbuf_pars_vertex:$f,logdepthbuf_vertex:jf,map_fragment:Qf,map_pars_fragment:tp,map_particle_fragment:ep,map_particle_pars_fragment:np,metalnessmap_fragment:ip,metalnessmap_pars_fragment:sp,morphinstance_vertex:rp,morphcolor_vertex:ap,morphnormal_vertex:op,morphtarget_pars_vertex:lp,morphtarget_vertex:cp,normal_fragment_begin:hp,normal_fragment_maps:up,normal_pars_fragment:dp,normal_pars_vertex:fp,normal_vertex:pp,normalmap_pars_fragment:mp,clearcoat_normal_fragment_begin:gp,clearcoat_normal_fragment_maps:_p,clearcoat_pars_fragment:xp,iridescence_pars_fragment:yp,opaque_fragment:vp,packing:Mp,premultiplied_alpha_fragment:Sp,project_vertex:bp,dithering_fragment:Ep,dithering_pars_fragment:Tp,roughnessmap_fragment:wp,roughnessmap_pars_fragment:Ap,shadowmap_pars_fragment:Rp,shadowmap_pars_vertex:Cp,shadowmap_vertex:Pp,shadowmask_pars_fragment:Ip,skinbase_vertex:Lp,skinning_pars_vertex:Dp,skinning_vertex:Np,skinnormal_vertex:Up,specularmap_fragment:Fp,specularmap_pars_fragment:Op,tonemapping_fragment:Bp,tonemapping_pars_fragment:zp,transmission_fragment:kp,transmission_pars_fragment:Hp,uv_pars_fragment:Vp,uv_pars_vertex:Gp,uv_vertex:Wp,worldpos_vertex:Xp,background_vert:qp,background_frag:Yp,backgroundCube_vert:Zp,backgroundCube_frag:Jp,cube_vert:Kp,cube_frag:$p,depth_vert:jp,depth_frag:Qp,distance_vert:tm,distance_frag:em,equirect_vert:nm,equirect_frag:im,linedashed_vert:sm,linedashed_frag:rm,meshbasic_vert:am,meshbasic_frag:om,meshlambert_vert:lm,meshlambert_frag:cm,meshmatcap_vert:hm,meshmatcap_frag:um,meshnormal_vert:dm,meshnormal_frag:fm,meshphong_vert:pm,meshphong_frag:mm,meshphysical_vert:gm,meshphysical_frag:_m,meshtoon_vert:xm,meshtoon_frag:ym,points_vert:vm,points_frag:Mm,shadow_vert:Sm,shadow_frag:bm,sprite_vert:Em,sprite_frag:Tm},Lt={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new se},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new se}},envmap:{envMap:{value:null},envMapRotation:{value:new se},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new se}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new se}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new se},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new se},normalScale:{value:new Ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new se},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new se}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new se}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new se}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0},uvTransform:{value:new se}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new Ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new se},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0}}},_i={basic:{uniforms:pn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:fe.meshbasic_vert,fragmentShader:fe.meshbasic_frag},lambert:{uniforms:pn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new Ot(0)},envMapIntensity:{value:1}}]),vertexShader:fe.meshlambert_vert,fragmentShader:fe.meshlambert_frag},phong:{uniforms:pn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:fe.meshphong_vert,fragmentShader:fe.meshphong_frag},standard:{uniforms:pn([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag},toon:{uniforms:pn([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new Ot(0)}}]),vertexShader:fe.meshtoon_vert,fragmentShader:fe.meshtoon_frag},matcap:{uniforms:pn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:fe.meshmatcap_vert,fragmentShader:fe.meshmatcap_frag},points:{uniforms:pn([Lt.points,Lt.fog]),vertexShader:fe.points_vert,fragmentShader:fe.points_frag},dashed:{uniforms:pn([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:fe.linedashed_vert,fragmentShader:fe.linedashed_frag},depth:{uniforms:pn([Lt.common,Lt.displacementmap]),vertexShader:fe.depth_vert,fragmentShader:fe.depth_frag},normal:{uniforms:pn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:fe.meshnormal_vert,fragmentShader:fe.meshnormal_frag},sprite:{uniforms:pn([Lt.sprite,Lt.fog]),vertexShader:fe.sprite_vert,fragmentShader:fe.sprite_frag},background:{uniforms:{uvTransform:{value:new se},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:fe.background_vert,fragmentShader:fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new se}},vertexShader:fe.backgroundCube_vert,fragmentShader:fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:fe.cube_vert,fragmentShader:fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:fe.equirect_vert,fragmentShader:fe.equirect_frag},distance:{uniforms:pn([Lt.common,Lt.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:fe.distance_vert,fragmentShader:fe.distance_frag},shadow:{uniforms:pn([Lt.lights,Lt.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:fe.shadow_vert,fragmentShader:fe.shadow_frag}};_i.physical={uniforms:pn([_i.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new se},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new se},clearcoatNormalScale:{value:new Ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new se},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new se},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new se},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new se},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new se},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new se},transmissionSamplerSize:{value:new Ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new se},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new se},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new se},anisotropyVector:{value:new Ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new se}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag};var sl={r:0,b:0,g:0},wm=new Ee,Pu=new se;Pu.set(-1,0,0,0,1,0,0,0,1);function Am(i,t,e,n,s,r){let a=new Ot(0),o=s===!0?0:1,l,c,u=null,f=0,h=null;function m(w){let D=w.isScene===!0?w.background:null;if(D&&D.isTexture){let M=w.backgroundBlurriness>0;D=t.get(D,M)}return D}function x(w){let D=!1,M=m(w);M===null?p(a,o):M&&M.isColor&&(p(M,1),D=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function S(w,D){let M=m(D);M&&(M.isCubeTexture||M.mapping===Vr)?(c===void 0&&(c=new de(new Nn(1,1,1),new Un({name:"BackgroundCubeMaterial",uniforms:ps(_i.backgroundCube.uniforms),vertexShader:_i.backgroundCube.vertexShader,fragmentShader:_i.backgroundCube.fragmentShader,side:an,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,T,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(wm.makeRotationFromEuler(D.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Pu),c.material.toneMapped=_e.getTransfer(M.colorSpace)!==Pe,(u!==M||f!==M.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,h=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new de(new hs(2,2),new Un({name:"BackgroundMaterial",uniforms:ps(_i.background.uniforms),vertexShader:_i.background.vertexShader,fragmentShader:_i.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,l.material.toneMapped=_e.getTransfer(M.colorSpace)!==Pe,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,f=M.version,h=i.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function p(w,D){w.getRGB(sl,yc(i)),e.buffers.color.setClear(sl.r,sl.g,sl.b,D,r)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,D=1){a.set(w),o=D,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(w){o=w,p(a,o)},render:x,addToRenderList:S,dispose:d}}function Rm(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(z,H,G,U,Z){let Y=!1,nt=f(z,U,G,H);r!==nt&&(r=nt,c(r.object)),Y=m(z,U,G,Z),Y&&x(z,U,G,Z),Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(Y||a)&&(a=!1,M(z,H,G,U),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function l(){return i.createVertexArray()}function c(z){return i.bindVertexArray(z)}function u(z){return i.deleteVertexArray(z)}function f(z,H,G,U){let Z=U.wireframe===!0,Y=n[H.id];Y===void 0&&(Y={},n[H.id]=Y);let nt=z.isInstancedMesh===!0?z.id:0,j=Y[nt];j===void 0&&(j={},Y[nt]=j);let $=j[G.id];$===void 0&&($={},j[G.id]=$);let st=$[Z];return st===void 0&&(st=h(l()),$[Z]=st),st}function h(z){let H=[],G=[],U=[];for(let Z=0;Z<e;Z++)H[Z]=0,G[Z]=0,U[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:G,attributeDivisors:U,object:z,attributes:{},index:null}}function m(z,H,G,U){let Z=r.attributes,Y=H.attributes,nt=0,j=G.getAttributes();for(let $ in j)if(j[$].location>=0){let W=Z[$],Nt=Y[$];if(Nt===void 0&&($==="instanceMatrix"&&z.instanceMatrix&&(Nt=z.instanceMatrix),$==="instanceColor"&&z.instanceColor&&(Nt=z.instanceColor)),W===void 0||W.attribute!==Nt||Nt&&W.data!==Nt.data)return!0;nt++}return r.attributesNum!==nt||r.index!==U}function x(z,H,G,U){let Z={},Y=H.attributes,nt=0,j=G.getAttributes();for(let $ in j)if(j[$].location>=0){let W=Y[$];W===void 0&&($==="instanceMatrix"&&z.instanceMatrix&&(W=z.instanceMatrix),$==="instanceColor"&&z.instanceColor&&(W=z.instanceColor));let Nt={};Nt.attribute=W,W&&W.data&&(Nt.data=W.data),Z[$]=Nt,nt++}r.attributes=Z,r.attributesNum=nt,r.index=U}function S(){let z=r.newAttributes;for(let H=0,G=z.length;H<G;H++)z[H]=0}function p(z){d(z,0)}function d(z,H){let G=r.newAttributes,U=r.enabledAttributes,Z=r.attributeDivisors;G[z]=1,U[z]===0&&(i.enableVertexAttribArray(z),U[z]=1),Z[z]!==H&&(i.vertexAttribDivisor(z,H),Z[z]=H)}function w(){let z=r.newAttributes,H=r.enabledAttributes;for(let G=0,U=H.length;G<U;G++)H[G]!==z[G]&&(i.disableVertexAttribArray(G),H[G]=0)}function D(z,H,G,U,Z,Y,nt){nt===!0?i.vertexAttribIPointer(z,H,G,Z,Y):i.vertexAttribPointer(z,H,G,U,Z,Y)}function M(z,H,G,U){S();let Z=U.attributes,Y=G.getAttributes(),nt=H.defaultAttributeValues;for(let j in Y){let $=Y[j];if($.location>=0){let st=Z[j];if(st===void 0&&(j==="instanceMatrix"&&z.instanceMatrix&&(st=z.instanceMatrix),j==="instanceColor"&&z.instanceColor&&(st=z.instanceColor)),st!==void 0){let W=st.normalized,Nt=st.itemSize,ct=t.get(st);if(ct===void 0)continue;let ve=ct.buffer,ge=ct.type,zt=ct.bytesPerElement,ot=ge===i.INT||ge===i.UNSIGNED_INT||st.gpuType===xo;if(st.isInterleavedBufferAttribute){let pt=st.data,Bt=pt.stride,te=st.offset;if(pt.isInstancedInterleavedBuffer){for(let At=0;At<$.locationSize;At++)d($.location+At,pt.meshPerAttribute);z.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=pt.meshPerAttribute*pt.count)}else for(let At=0;At<$.locationSize;At++)p($.location+At);i.bindBuffer(i.ARRAY_BUFFER,ve);for(let At=0;At<$.locationSize;At++)D($.location+At,Nt/$.locationSize,ge,W,Bt*zt,(te+Nt/$.locationSize*At)*zt,ot)}else{if(st.isInstancedBufferAttribute){for(let pt=0;pt<$.locationSize;pt++)d($.location+pt,st.meshPerAttribute);z.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let pt=0;pt<$.locationSize;pt++)p($.location+pt);i.bindBuffer(i.ARRAY_BUFFER,ve);for(let pt=0;pt<$.locationSize;pt++)D($.location+pt,Nt/$.locationSize,ge,W,Nt*zt,Nt/$.locationSize*pt*zt,ot)}}else if(nt!==void 0){let W=nt[j];if(W!==void 0)switch(W.length){case 2:i.vertexAttrib2fv($.location,W);break;case 3:i.vertexAttrib3fv($.location,W);break;case 4:i.vertexAttrib4fv($.location,W);break;default:i.vertexAttrib1fv($.location,W)}}}}w()}function b(){E();for(let z in n){let H=n[z];for(let G in H){let U=H[G];for(let Z in U){let Y=U[Z];for(let nt in Y)u(Y[nt].object),delete Y[nt];delete U[Z]}}delete n[z]}}function T(z){if(n[z.id]===void 0)return;let H=n[z.id];for(let G in H){let U=H[G];for(let Z in U){let Y=U[Z];for(let nt in Y)u(Y[nt].object),delete Y[nt];delete U[Z]}}delete n[z.id]}function P(z){for(let H in n){let G=n[H];for(let U in G){let Z=G[U];if(Z[z.id]===void 0)continue;let Y=Z[z.id];for(let nt in Y)u(Y[nt].object),delete Y[nt];delete Z[z.id]}}}function _(z){for(let H in n){let G=n[H],U=z.isInstancedMesh===!0?z.id:0,Z=G[U];if(Z!==void 0){for(let Y in Z){let nt=Z[Y];for(let j in nt)u(nt[j].object),delete nt[j];delete Z[Y]}delete G[U],Object.keys(G).length===0&&delete n[H]}}}function E(){L(),a=!0,r!==s&&(r=s,c(r.object))}function L(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:L,dispose:b,releaseStatesOfGeometry:T,releaseStatesOfObject:_,releaseStatesOfProgram:P,initAttributes:S,enableAttribute:p,disableUnusedAttributes:w}}function Cm(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let m=0;m<u;m++)h+=c[m];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Pm(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==Xn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let _=P===si&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(P!==Sn&&P!==Wn&&!_&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&($t("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let f=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&$t("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),b=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:m,maxVertexTextures:x,maxTextureSize:S,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:w,maxVaryings:D,maxFragmentUniforms:M,maxSamples:b,samples:T}}function Im(i){let t=this,e=null,n=0,s=!1,r=!1,a=new In,o=new se,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let m=f.length!==0||h||n!==0||s;return s=h,n=f.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){e=u(f,h,0)},this.setState=function(f,h,m){let x=f.clippingPlanes,S=f.clipIntersection,p=f.clipShadows,d=i.get(f);if(!s||x===null||x.length===0||r&&!p)r?u(null):c();else{let w=r?0:n,D=w*4,M=d.clippingState||null;l.value=M,M=u(x,h,D,m);for(let b=0;b!==D;++b)M[b]=e[b];d.clippingState=M,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,h,m,x){let S=f!==null?f.length:0,p=null;if(S!==0){if(p=l.value,x!==!0||p===null){let d=m+S*4,w=h.matrixWorldInverse;o.getNormalMatrix(w),(p===null||p.length<d)&&(p=new Float32Array(d));for(let D=0,M=m;D!==S;++D,M+=4)a.copy(f[D]).applyMatrix4(w,o),a.normal.toArray(p,M),p[M+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,p}}var ar=4,Lm=6,Dm=20,Nm=256,Kr=new js,lu=new Ot,bc=null,Ec=0,Tc=0,wc=!1,Um=new I,ms=new I,al=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=Um}=r;bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Tc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=uu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=hu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(bc,Ec,Tc),this._renderer.xr.enabled=wc,t.scissorTest=!1,rr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Zi||t.mapping===fs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Tc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:cn,minFilter:cn,generateMipmaps:!1,type:si,format:Xn,colorSpace:Er,depthBuffer:!1},s=cu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cu(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Fm(r)),this._blurMaterial=Bm(r,t,e),this._ggxMaterial=Om(r,t,e)}return s}_compileMaterial(t){let e=new de(new Te,t);this._renderer.compile(e,Kr)}_sceneToCubeUV(t,e,n,s,r){let l=new fn(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,m=f.toneMapping;f.getClearColor(lu),f.toneMapping=ni,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new de(new Nn,new rn({name:"PMREM.Background",side:an,depthWrite:!1,depthTest:!1})));let S=this._backgroundBox,p=S.material,d=!1,w=t.background;w?w.isColor&&(p.color.copy(w),t.background=null,d=!0):(p.color.copy(lu),d=!0);for(let D=0;D<6;D++){let M=D%3;M===0?(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[D],r.y,r.z)):M===1?(l.up.set(0,0,c[D]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[D],r.z)):(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[D]));let b=this._cubeSize;rr(s,M*b,D>2?b:0,b,b),f.setRenderTarget(s),d&&f.render(S,l),f.render(t,l)}f.toneMapping=m,f.autoClear=h,t.background=w}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Zi||t.mapping===fs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=uu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=hu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;rr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Kr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=c*1.25,m=f*h,{_lodMax:x}=this,S=this._sizeLods[n],p=3*S*(n>x-ar?n-x+ar:0),d=4*(this._cubeSize-S);l.envMap.value=t.texture,l.roughness.value=m,l.mipInt.value=x-e,rr(r,p,d,3*S,2*S),s.setRenderTarget(r),s.render(o,Kr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=x-n,rr(t,p,d,3*S,2*S),s.setRenderTarget(t),s.render(o,Kr)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],f=3*u*(s>this._lodMax-ar?s-this._lodMax+ar:0),h=4*(this._cubeSize-u);rr(e,f,h,3*u,2*u),a.setRenderTarget(e),a.render(l,Kr)}};function Fm(i){let t=[],e=[],n=i,s=i-ar+1+Lm;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,h=6,m=3,x=new Float32Array(m*h*f),S=new Float32Array(m*h*f);for(let d=0;d<f;d++){let w=d%3*2/3-1,D=d>2?0:-1,M=[w,D,0,w+2/3,D,0,w+2/3,D+1,0,w,D,0,w+2/3,D+1,0,w,D+1,0];x.set(M,m*h*d);for(let b=0;b<h;b++){let T=u[b*2]*2-1,P=u[b*2+1]*2-1;d===0?ms.set(1,P,T):d===1?ms.set(-T,1,-P):d===2?ms.set(-T,P,1):d===3?ms.set(-1,P,-T):d===4?ms.set(-T,-1,P):ms.set(T,P,-1),ms.toArray(S,(d*h+b)*m)}}let p=new Te;p.setAttribute("position",new ke(x,m)),p.setAttribute("outputDirection",new ke(S,m)),e.push(new de(p,null)),n>ar&&n--}return{lodMeshes:e,sizeLods:t}}function cu(i,t,e){let n=new vn(i,t,e);return n.texture.mapping=Vr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function rr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Om(i,t,e){return new Un({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Nm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:cl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:mi,depthTest:!1,depthWrite:!1})}function Bm(i,t,e){return new Un({name:"SphericalGaussianBlur",defines:{SAMPLES:Dm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:cl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:mi,depthTest:!1,depthWrite:!1})}function hu(){return new Un({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:mi,depthTest:!1,depthWrite:!1})}function uu(){return new Un({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:mi,depthTest:!1,depthWrite:!1})}function cl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var ol=class extends vn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Nr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Nn(5,5,5),r=new Un({name:"CubemapFromEquirect",uniforms:ps(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:an,blending:mi});r.uniforms.tEquirect.value=e;let a=new de(s,r),o=e.minFilter;return e.minFilter===Ji&&(e.minFilter=cn),new fo(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function zm(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,m=!1){return h==null?null:m?a(h):r(h)}function r(h){if(h&&h.isTexture){let m=h.mapping;if(m===mo||m===go)if(t.has(h)){let x=t.get(h).texture;return o(x,h.mapping)}else{let x=h.image;if(x&&x.height>0){let S=new ol(x.height);return S.fromEquirectangularTexture(i,h),t.set(h,S),h.addEventListener("dispose",c),o(S.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let m=h.mapping,x=m===mo||m===go,S=m===Zi||m===fs;if(x||S){let p=e.get(h),d=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new al(i)),p=x?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,e.set(h,p),p.texture;if(p!==void 0)return p.texture;{let w=h.image;return x&&w&&w.height>0||S&&w&&l(w)?(n===null&&(n=new al(i)),p=x?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,e.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function o(h,m){return m===mo?h.mapping=Zi:m===go&&(h.mapping=fs),h}function l(h){let m=0,x=6;for(let S=0;S<x;S++)h[S]!==void 0&&m++;return m===x}function c(h){let m=h.target;m.removeEventListener("dispose",c);let x=t.get(m);x!==void 0&&(t.delete(m),x.dispose())}function u(h){let m=h.target;m.removeEventListener("dispose",u);let x=e.get(m);x!==void 0&&(e.delete(m),x.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function km(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&os("WebGLRenderer: "+n+" extension not supported."),s}}}function Hm(i,t,e,n){let s={},r=new WeakMap;function a(f){let h=f.target;h.index!==null&&t.remove(h.index);for(let x in h.attributes)t.remove(h.attributes[x]);h.removeEventListener("dispose",a),delete s[h.id];let m=r.get(h);m&&(t.remove(m),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(f,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function l(f){let h=f.attributes;for(let m in h)t.update(h[m],i.ARRAY_BUFFER)}function c(f){let h=[],m=f.index,x=f.attributes.position,S=0;if(x===void 0)return;if(m!==null){let w=m.array;S=m.version;for(let D=0,M=w.length;D<M;D+=3){let b=w[D+0],T=w[D+1],P=w[D+2];h.push(b,T,T,P,P,b)}}else{let w=x.array;S=x.version;for(let D=0,M=w.length/3-1;D<M;D+=3){let b=D+0,T=D+1,P=D+2;h.push(b,T,T,P,P,b)}}let p=new(x.count>=65535?Ir:Pr)(h,1);p.version=S;let d=r.get(f);d&&t.remove(d),r.set(f,p)}function u(f){let h=r.get(f);if(h){let m=f.index;m!==null&&h.version<m.version&&c(f)}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function Vm(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,h){i.drawElements(n,h,r,f*a),e.update(h,n,1)}function c(f,h,m){m!==0&&(i.drawElementsInstanced(n,h,r,f*a,m),e.update(h,n,m))}function u(f,h,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,m);let S=0;for(let p=0;p<m;p++)S+=h[p];e.update(S,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Gm(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Qt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Wm(i,t,e){let n=new WeakMap,s=new Oe;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==f){let E=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",E)};h!==void 0&&h.texture.dispose();let m=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,S=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],D=0;m===!0&&(D=1),x===!0&&(D=2),S===!0&&(D=3);let M=o.attributes.position.count*D,b=1;M>t.maxTextureSize&&(b=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let T=new Float32Array(M*b*4*f),P=new Rr(T,M,b,f);P.type=Wn,P.needsUpdate=!0;let _=D*4;for(let L=0;L<f;L++){let z=p[L],H=d[L],G=w[L],U=M*b*4*L;for(let Z=0;Z<z.count;Z++){let Y=Z*_;m===!0&&(s.fromBufferAttribute(z,Z),T[U+Y+0]=s.x,T[U+Y+1]=s.y,T[U+Y+2]=s.z,T[U+Y+3]=0),x===!0&&(s.fromBufferAttribute(H,Z),T[U+Y+4]=s.x,T[U+Y+5]=s.y,T[U+Y+6]=s.z,T[U+Y+7]=0),S===!0&&(s.fromBufferAttribute(G,Z),T[U+Y+8]=s.x,T[U+Y+9]=s.y,T[U+Y+10]=s.z,T[U+Y+11]=G.itemSize===4?s.w:1)}}h={count:f,texture:P,size:new Ft(M,b)},n.set(o,h),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let m=0;for(let S=0;S<c.length;S++)m+=c[S];let x=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Xm(i,t,e,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,f=c.geometry,h=t.get(c,f);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let m=c.skeleton;r.get(m)!==u&&(m.update(),r.set(m,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var qm={[ec]:"LINEAR_TONE_MAPPING",[nc]:"REINHARD_TONE_MAPPING",[ic]:"CINEON_TONE_MAPPING",[sc]:"ACES_FILMIC_TONE_MAPPING",[ac]:"AGX_TONE_MAPPING",[oc]:"NEUTRAL_TONE_MAPPING",[rc]:"CUSTOM_TONE_MAPPING"};function Ym(i,t,e,n,s,r){let a=new vn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Te;c.setAttribute("position",new De([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new De([0,2,0,0,2,0],2));let u=new ja({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new de(c,u),h=new js(-1,1,1,-1,0,1),m=null,x=null,S=!1,p,d=null,w=[],D=!1;this.setSize=function(M,b){a.setSize(M,b),o!==null&&o.setSize(M,b),l!==null&&l.setSize(M,b);for(let T=0;T<w.length;T++){let P=w[T];P.setSize&&P.setSize(M,b)}},this.setEffects=function(M){w=M,D=w.length>0&&w[0].isRenderPass===!0;let b=a.width,T=a.height;w.length>0&&o===null&&(o=new vn(b,T,{type:si,depthBuffer:!1,stencilBuffer:!1}),l=new vn(b,T,{type:si,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<w.length;P++){let _=w[P];_.setSize&&_.setSize(b,T)}},this.begin=function(M,b){if(S||M.toneMapping===ni&&w.length===0)return!1;if(d=b,b!==null){let T=b.width,P=b.height;(a.width!==T||a.height!==P)&&this.setSize(T,P)}return D===!1&&M.setRenderTarget(a),p=M.toneMapping,M.toneMapping=ni,!0},this.hasRenderPass=function(){return D},this.end=function(M,b){M.toneMapping=p,S=!0;let T=a,P=o;for(let _=0;_<w.length;_++){let E=w[_];E.enabled!==!1&&(E.render(M,P,T,b),E.needsSwap!==!1&&(T=P,P=P===o?l:o))}if(m!==M.outputColorSpace||x!==M.toneMapping){m=M.outputColorSpace,x=M.toneMapping,u.defines={},_e.getTransfer(m)===Pe&&(u.defines.SRGB_TRANSFER="");let _=qm[x];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=T.texture,M.setRenderTarget(d),M.render(f,h),d=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var Iu=new gn,Cc=new ki(1,1),Lu=new Rr,Du=new Za,Nu=new Nr,du=[],fu=[],pu=new Float32Array(16),mu=new Float32Array(9),gu=new Float32Array(4);function lr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=du[s];if(r===void 0&&(r=new Float32Array(s),du[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Qe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function tn(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function hl(i,t){let e=fu[t];e===void 0&&(e=new Int32Array(t),fu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Zm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Jm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qe(e,t))return;i.uniform2fv(this.addr,t),tn(e,t)}}function Km(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Qe(e,t))return;i.uniform3fv(this.addr,t),tn(e,t)}}function $m(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qe(e,t))return;i.uniform4fv(this.addr,t),tn(e,t)}}function jm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Qe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),tn(e,t)}else{if(Qe(e,n))return;gu.set(n),i.uniformMatrix2fv(this.addr,!1,gu),tn(e,n)}}function Qm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Qe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),tn(e,t)}else{if(Qe(e,n))return;mu.set(n),i.uniformMatrix3fv(this.addr,!1,mu),tn(e,n)}}function tg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Qe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),tn(e,t)}else{if(Qe(e,n))return;pu.set(n),i.uniformMatrix4fv(this.addr,!1,pu),tn(e,n)}}function eg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qe(e,t))return;i.uniform2iv(this.addr,t),tn(e,t)}}function ig(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Qe(e,t))return;i.uniform3iv(this.addr,t),tn(e,t)}}function sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qe(e,t))return;i.uniform4iv(this.addr,t),tn(e,t)}}function rg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qe(e,t))return;i.uniform2uiv(this.addr,t),tn(e,t)}}function og(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Qe(e,t))return;i.uniform3uiv(this.addr,t),tn(e,t)}}function lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qe(e,t))return;i.uniform4uiv(this.addr,t),tn(e,t)}}function cg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Cc.compareFunction=e.isReversedDepthBuffer()?il:nl,r=Cc):r=Iu,e.setTexture2D(t||r,s)}function hg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Du,s)}function ug(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Nu,s)}function dg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Lu,s)}function fg(i){switch(i){case 5126:return Zm;case 35664:return Jm;case 35665:return Km;case 35666:return $m;case 35674:return jm;case 35675:return Qm;case 35676:return tg;case 5124:case 35670:return eg;case 35667:case 35671:return ng;case 35668:case 35672:return ig;case 35669:case 35673:return sg;case 5125:return rg;case 36294:return ag;case 36295:return og;case 36296:return lg;case 35678:case 36198:case 36298:case 36306:case 35682:return cg;case 35679:case 36299:case 36307:return hg;case 35680:case 36300:case 36308:case 36293:return ug;case 36289:case 36303:case 36311:case 36292:return dg}}function pg(i,t){i.uniform1fv(this.addr,t)}function mg(i,t){let e=lr(t,this.size,2);i.uniform2fv(this.addr,e)}function gg(i,t){let e=lr(t,this.size,3);i.uniform3fv(this.addr,e)}function _g(i,t){let e=lr(t,this.size,4);i.uniform4fv(this.addr,e)}function xg(i,t){let e=lr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function yg(i,t){let e=lr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function vg(i,t){let e=lr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Mg(i,t){i.uniform1iv(this.addr,t)}function Sg(i,t){i.uniform2iv(this.addr,t)}function bg(i,t){i.uniform3iv(this.addr,t)}function Eg(i,t){i.uniform4iv(this.addr,t)}function Tg(i,t){i.uniform1uiv(this.addr,t)}function wg(i,t){i.uniform2uiv(this.addr,t)}function Ag(i,t){i.uniform3uiv(this.addr,t)}function Rg(i,t){i.uniform4uiv(this.addr,t)}function Cg(i,t,e){let n=this.cache,s=t.length,r=hl(e,s);Qe(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Cc:a=Iu;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function Pg(i,t,e){let n=this.cache,s=t.length,r=hl(e,s);Qe(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Du,r[a])}function Ig(i,t,e){let n=this.cache,s=t.length,r=hl(e,s);Qe(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Nu,r[a])}function Lg(i,t,e){let n=this.cache,s=t.length,r=hl(e,s);Qe(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Lu,r[a])}function Dg(i){switch(i){case 5126:return pg;case 35664:return mg;case 35665:return gg;case 35666:return _g;case 35674:return xg;case 35675:return yg;case 35676:return vg;case 5124:case 35670:return Mg;case 35667:case 35671:return Sg;case 35668:case 35672:return bg;case 35669:case 35673:return Eg;case 5125:return Tg;case 36294:return wg;case 36295:return Ag;case 36296:return Rg;case 35678:case 36198:case 36298:case 36306:case 35682:return Cg;case 35679:case 36299:case 36307:return Pg;case 35680:case 36300:case 36308:case 36293:return Ig;case 36289:case 36303:case 36311:case 36292:return Lg}}var Pc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=fg(e.type)}},Ic=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Dg(e.type)}},Lc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Ac=/(\w+)(\])?(\[|\.)?/g;function _u(i,t){i.seq.push(t),i.map[t.id]=t}function Ng(i,t,e){let n=i.name,s=n.length;for(Ac.lastIndex=0;;){let r=Ac.exec(n),a=Ac.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){_u(e,c===void 0?new Pc(o,i,t):new Ic(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new Lc(o),_u(e,f)),e=f}}}var or=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Ng(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function xu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Ug=37297,Fg=0;function Og(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var yu=new se;function Bg(i){_e._getMatrix(yu,_e.workingColorSpace,i);let t=`mat3( ${yu.elements.map(e=>e.toFixed(4))} )`;switch(_e.getTransfer(i)){case Tr:return[t,"LinearTransferOETF"];case Pe:return[t,"sRGBTransferOETF"];default:return $t("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function vu(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Og(i.getShaderSource(t),o)}else return r}function zg(i,t){let e=Bg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var kg={[ec]:"Linear",[nc]:"Reinhard",[ic]:"Cineon",[sc]:"ACESFilmic",[ac]:"AgX",[oc]:"Neutral",[rc]:"Custom"};function Hg(i,t){let e=kg[t];return e===void 0?($t("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var rl=new I;function Vg(){_e.getLuminanceCoefficients(rl);let i=rl.x.toFixed(4),t=rl.y.toFixed(4),e=rl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Gg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(jr).join(`
`)}function Wg(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Xg(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function jr(i){return i!==""}function Mu(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Su(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var qg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Dc(i){return i.replace(qg,Zg)}var Yg=new Map;function Zg(i,t){let e=fe[t];if(e===void 0){let n=Yg.get(t);if(n!==void 0)e=fe[n],$t('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Dc(e)}var Jg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bu(i){return i.replace(Jg,Kg)}function Kg(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Eu(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var $g={[us]:"SHADOWMAP_TYPE_PCF",[er]:"SHADOWMAP_TYPE_VSM"};function jg(i){return $g[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Qg={[Zi]:"ENVMAP_TYPE_CUBE",[fs]:"ENVMAP_TYPE_CUBE",[Vr]:"ENVMAP_TYPE_CUBE_UV"};function t0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Qg[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var e0={[fs]:"ENVMAP_MODE_REFRACTION"};function n0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":e0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var i0={[tc]:"ENVMAP_BLENDING_MULTIPLY",[Hh]:"ENVMAP_BLENDING_MIX",[Vh]:"ENVMAP_BLENDING_ADD"};function s0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":i0[i.combine]||"ENVMAP_BLENDING_NONE"}function r0(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function a0(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=jg(e),c=t0(e),u=n0(e),f=s0(e),h=r0(e),m=Gg(e),x=Wg(r),S=s.createProgram(),p,d,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(jr).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(jr).join(`
`),d.length>0&&(d+=`
`)):(p=[Eu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(jr).join(`
`),d=[Eu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ni?"#define TONE_MAPPING":"",e.toneMapping!==ni?fe.tonemapping_pars_fragment:"",e.toneMapping!==ni?Hg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",fe.colorspace_pars_fragment,zg("linearToOutputTexel",e.outputColorSpace),Vg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(jr).join(`
`)),a=Dc(a),a=Mu(a,e),a=Su(a,e),o=Dc(o),o=Mu(o,e),o=Su(o,e),a=bu(a),o=bu(o),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",e.glslVersion===gc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===gc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let D=w+p+a,M=w+d+o,b=xu(s,s.VERTEX_SHADER,D),T=xu(s,s.FRAGMENT_SHADER,M);s.attachShader(S,b),s.attachShader(S,T),e.index0AttributeName!==void 0?s.bindAttribLocation(S,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(S,0,"position"),s.linkProgram(S);function P(z){if(i.debug.checkShaderErrors){let H=s.getProgramInfoLog(S)||"",G=s.getShaderInfoLog(b)||"",U=s.getShaderInfoLog(T)||"",Z=H.trim(),Y=G.trim(),nt=U.trim(),j=!0,$=!0;if(s.getProgramParameter(S,s.LINK_STATUS)===!1)if(j=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,S,b,T);else{let st=vu(s,b,"vertex"),W=vu(s,T,"fragment");Qt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(S,s.VALIDATE_STATUS)+`

Material Name: `+z.name+`
Material Type: `+z.type+`

Program Info Log: `+Z+`
`+st+`
`+W)}else Z!==""?$t("WebGLProgram: Program Info Log:",Z):(Y===""||nt==="")&&($=!1);$&&(z.diagnostics={runnable:j,programLog:Z,vertexShader:{log:Y,prefix:p},fragmentShader:{log:nt,prefix:d}})}s.deleteShader(b),s.deleteShader(T),_=new or(s,S),E=Xg(s,S)}let _;this.getUniforms=function(){return _===void 0&&P(this),_};let E;this.getAttributes=function(){return E===void 0&&P(this),E};let L=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(S,Ug)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(S),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Fg++,this.cacheKey=t,this.usedTimes=1,this.program=S,this.vertexShader=b,this.fragmentShader=T,this}var o0=0,Nc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Uc(t),e.set(t,n)),n}},Uc=class{constructor(t){this.id=o0++,this.code=t,this.usedTimes=0}};function l0(i){return i===$i||i===Zr||i===Jr}function c0(i,t,e,n,s,r){let a=new Vs,o=new Nc,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(_){return l.add(_),_===0?"uv":`uv${_}`}function S(_,E,L,z,H,G){let U=z.fog,Z=H.geometry,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?z.environment:null,nt=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,j=t.get(_.envMap||Y,nt),$=j&&j.mapping===Vr?j.image.height:null,st=m[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&$t("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let W=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Nt=W!==void 0?W.length:0,ct=0;Z.morphAttributes.position!==void 0&&(ct=1),Z.morphAttributes.normal!==void 0&&(ct=2),Z.morphAttributes.color!==void 0&&(ct=3);let ve,ge,zt,ot;if(st){let Re=_i[st];ve=Re.vertexShader,ge=Re.fragmentShader}else{ve=_.vertexShader,ge=_.fragmentShader;let Re=o.getVertexShaderStage(_),Se=o.getFragmentShaderStage(_);o.update(_,Re,Se),zt=Re.id,ot=Se.id}let pt=i.getRenderTarget(),Bt=i.state.buffers.depth.getReversed(),te=H.isInstancedMesh===!0,At=H.isBatchedMesh===!0,ee=!!_.map,Ge=!!_.matcap,ce=!!j,xe=!!_.aoMap,Ae=!!_.lightMap,he=!!_.bumpMap&&_.wireframe===!1,ye=!!_.normalMap,We=!!_.displacementMap,Ke=!!_.emissiveMap,Ne=!!_.metalnessMap,Be=!!_.roughnessMap,O=_.anisotropy>0,Wt=_.clearcoat>0,Me=_.dispersion>0,A=_.retroreflectivity>0,g=_.iridescence>0,X=_.sheen>0,K=_.transmission>0,rt=O&&!!_.anisotropyMap,_t=Wt&&!!_.clearcoatMap,xt=Wt&&!!_.clearcoatNormalMap,at=Wt&&!!_.clearcoatRoughnessMap,ft=g&&!!_.iridescenceMap,vt=g&&!!_.iridescenceThicknessMap,Yt=X&&!!_.sheenColorMap,wt=X&&!!_.sheenRoughnessMap,Mt=!!_.specularMap,Zt=!!_.specularColorMap,Kt=!!_.specularIntensityMap,re=K&&!!_.transmissionMap,B=K&&!!_.thicknessMap,bt=!!_.gradientMap,dt=!!_.alphaMap,Et=_.alphaTest>0,Rt=!!_.alphaHash,mt=!!_.extensions,Jt=ni;_.toneMapped&&(pt===null||pt.isXRRenderTarget===!0)&&(Jt=i.toneMapping);let Ht={shaderID:st,shaderType:_.type,shaderName:_.name,vertexShader:ve,fragmentShader:ge,defines:_.defines,customVertexShaderID:zt,customFragmentShaderID:ot,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:At,batchingColor:At&&H._colorsTexture!==null,instancing:te,instancingColor:te&&H.instanceColor!==null,instancingMorph:te&&H.morphTexture!==null,outputColorSpace:pt===null?i.outputColorSpace:pt.isXRRenderTarget===!0?pt.texture.colorSpace:_e.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:ee,matcap:Ge,envMap:ce,envMapMode:ce&&j.mapping,envMapCubeUVHeight:$,aoMap:xe,lightMap:Ae,bumpMap:he,normalMap:ye,displacementMap:We,emissiveMap:Ke,normalMapObjectSpace:ye&&_.normalMapType===Xh,normalMapTangentSpace:ye&&_.normalMapType===el,packedNormalMap:ye&&_.normalMapType===el&&l0(_.normalMap.format),metalnessMap:Ne,roughnessMap:Be,anisotropy:O,anisotropyMap:rt,clearcoat:Wt,clearcoatMap:_t,clearcoatNormalMap:xt,clearcoatRoughnessMap:at,dispersion:Me,retroreflection:A,iridescence:g,iridescenceMap:ft,iridescenceThicknessMap:vt,sheen:X,sheenColorMap:Yt,sheenRoughnessMap:wt,specularMap:Mt,specularColorMap:Zt,specularIntensityMap:Kt,transmission:K,transmissionMap:re,thicknessMap:B,gradientMap:bt,opaque:_.transparent===!1&&_.blending===nr&&_.alphaToCoverage===!1,alphaMap:dt,alphaTest:Et,alphaHash:Rt,combine:_.combine,mapUv:ee&&x(_.map.channel),aoMapUv:xe&&x(_.aoMap.channel),lightMapUv:Ae&&x(_.lightMap.channel),bumpMapUv:he&&x(_.bumpMap.channel),normalMapUv:ye&&x(_.normalMap.channel),displacementMapUv:We&&x(_.displacementMap.channel),emissiveMapUv:Ke&&x(_.emissiveMap.channel),metalnessMapUv:Ne&&x(_.metalnessMap.channel),roughnessMapUv:Be&&x(_.roughnessMap.channel),anisotropyMapUv:rt&&x(_.anisotropyMap.channel),clearcoatMapUv:_t&&x(_.clearcoatMap.channel),clearcoatNormalMapUv:xt&&x(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:at&&x(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ft&&x(_.iridescenceMap.channel),iridescenceThicknessMapUv:vt&&x(_.iridescenceThicknessMap.channel),sheenColorMapUv:Yt&&x(_.sheenColorMap.channel),sheenRoughnessMapUv:wt&&x(_.sheenRoughnessMap.channel),specularMapUv:Mt&&x(_.specularMap.channel),specularColorMapUv:Zt&&x(_.specularColorMap.channel),specularIntensityMapUv:Kt&&x(_.specularIntensityMap.channel),transmissionMapUv:re&&x(_.transmissionMap.channel),thicknessMapUv:B&&x(_.thicknessMap.channel),alphaMapUv:dt&&x(_.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(ye||O),vertexNormals:!!Z.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!Z.attributes.uv&&(ee||dt),fog:!!U,useFog:_.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||Z.attributes.normal===void 0&&ye===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Bt,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:Z.attributes.position!==void 0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Nt,morphTextureStride:ct,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:G.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:Jt,decodeVideoTexture:ee&&_.map.isVideoTexture===!0&&_e.getTransfer(_.map.colorSpace)===Pe,decodeVideoTextureEmissive:Ke&&_.emissiveMap.isVideoTexture===!0&&_e.getTransfer(_.emissiveMap.colorSpace)===Pe,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ye,flipSided:_.side===an,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:mt&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(mt&&_.extensions.multiDraw===!0||At)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ht.vertexUv1s=l.has(1),Ht.vertexUv2s=l.has(2),Ht.vertexUv3s=l.has(3),l.clear(),Ht}function p(_){let E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(let L in _.defines)E.push(L),E.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(d(E,_),w(E,_),E.push(i.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function d(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapCubeUVHeight),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.morphAttributeCount),_.push(E.numSunLights),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numSunLightShadows),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function w(_,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function D(_){let E=m[_.type],L;if(E){let z=_i[E];L=ru.clone(z.uniforms)}else L=_.uniforms;return L}function M(_,E){let L=u.get(E);return L!==void 0?++L.usedTimes:(L=new a0(i,E,_,s),c.push(L),u.set(E,L)),L}function b(_){if(--_.usedTimes===0){let E=c.indexOf(_);c[E]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function T(_){o.remove(_)}function P(){o.dispose()}return{getParameters:S,getProgramCacheKey:p,getUniforms:D,acquireProgram:M,releaseProgram:b,releaseShaderCache:T,programs:c,dispose:P}}function h0(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function u0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Tu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function wu(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h){let m=0;return h.isInstancedMesh&&(m+=2),h.isSkinnedMesh&&(m+=1),m}function o(h,m,x,S,p,d){let w=i[t];return w===void 0?(w={id:h.id,object:h,geometry:m,material:x,materialVariant:a(h),groupOrder:S,renderOrder:h.renderOrder,z:p,group:d},i[t]=w):(w.id=h.id,w.object=h,w.geometry=m,w.material=x,w.materialVariant=a(h),w.groupOrder=S,w.renderOrder=h.renderOrder,w.z=p,w.group=d),t++,w}function l(h,m,x,S,p,d,w){w.reversedDepth===!0&&(p=-p);let D=o(h,m,x,S,p,d);x.transmission>0?n.push(D):x.transparent===!0?s.push(D):e.push(D)}function c(h,m,x,S,p,d){let w=o(h,m,x,S,p,d);x.transmission>0?n.unshift(w):x.transparent===!0?s.unshift(w):e.unshift(w)}function u(h,m){e.length>1&&e.sort(h||u0),n.length>1&&n.sort(m||Tu),s.length>1&&s.sort(m||Tu)}function f(){for(let h=t,m=i.length;h<m;h++){let x=i[h];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function d0(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new wu,i.set(n,[a])):s>=r.length?(a=new wu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function f0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new I,color:new Ot};break;case"SpotLight":e={position:new I,direction:new I,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":e={color:new Ot,position:new I,halfWidth:new I,halfHeight:new I};break}return i[t.id]=e,e}}}function p0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ft};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ft};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var m0=0;function g0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function _0(i){let t=new f0,e=p0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);let s=new I,r=new Ee,a=new Ee;function o(c){let u=0,f=0,h=0;for(let H=0;H<9;H++)n.probe[H].set(0,0,0);let m=0,x=0,S=0,p=0,d=0,w=0,D=0,M=0,b=0,T=0,P=0,_=0,E=0,L=0;c.sort(g0);for(let H=0,G=c.length;H<G;H++){let U=c[H],Z=U.color,Y=U.intensity,nt=U.distance,j=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===$i?j=U.shadow.map.texture:j=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=Z.r*Y,f+=Z.g*Y,h+=Z.b*Y;else if(U.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(U.sh.coefficients[$],Y);L++}else if(U.isSunLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let st=U.shadow,W=e.get(U);W.shadowIntensity=st.intensity,W.shadowBias=st.bias,W.shadowNormalBias=st.normalBias,W.shadowRadius=st.radius,W.shadowMapSize.copy(st.mapSize).multiply(st.getFrameExtents()),n.sunShadow[x]=W,n.sunShadowMap[x]=j;let Nt=st.getViewportCount();for(let ct=0;ct<Nt;ct++)n.sunShadowMatrix[S+ct]=st.getMatrix(ct),n.sunShadowCascade[S+ct]=st._cascadeData[ct];S+=Nt,x++}n.sun[m]=$,m++}else if(U.isDirectionalLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let st=U.shadow,W=e.get(U);W.shadowIntensity=st.intensity,W.shadowBias=st.bias,W.shadowNormalBias=st.normalBias,W.shadowRadius=st.radius,W.shadowMapSize=st.mapSize,n.directionalShadow[p]=W,n.directionalShadowMap[p]=j,n.directionalShadowMatrix[p]=U.shadow.matrix,b++}n.directional[p]=$,p++}else if(U.isSpotLight){let $=t.get(U);$.position.setFromMatrixPosition(U.matrixWorld),$.color.copy(Z).multiplyScalar(Y),$.distance=nt,$.coneCos=Math.cos(U.angle),$.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),$.decay=U.decay,n.spot[w]=$;let st=U.shadow;if(U.map&&(n.spotLightMap[_]=U.map,_++,st.updateMatrices(U),U.castShadow&&E++),n.spotLightMatrix[w]=st.matrix,U.castShadow){let W=e.get(U);W.shadowIntensity=st.intensity,W.shadowBias=st.bias,W.shadowNormalBias=st.normalBias,W.shadowRadius=st.radius,W.shadowMapSize=st.mapSize,n.spotShadow[w]=W,n.spotShadowMap[w]=j,P++}w++}else if(U.isRectAreaLight){let $=t.get(U);$.color.copy(Z).multiplyScalar(Y),$.halfWidth.set(U.width*.5,0,0),$.halfHeight.set(0,U.height*.5,0),n.rectArea[D]=$,D++}else if(U.isPointLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),$.distance=U.distance,$.decay=U.decay,U.castShadow){let st=U.shadow,W=e.get(U);W.shadowIntensity=st.intensity,W.shadowBias=st.bias,W.shadowNormalBias=st.normalBias,W.shadowRadius=st.radius,W.shadowMapSize=st.mapSize,W.shadowCameraNear=st.camera.near,W.shadowCameraFar=st.camera.far,n.pointShadow[d]=W,n.pointShadowMap[d]=j,n.pointShadowMatrix[d]=U.shadow.matrix,T++}n.point[d]=$,d++}else if(U.isHemisphereLight){let $=t.get(U);$.skyColor.copy(U.color).multiplyScalar(Y),$.groundColor.copy(U.groundColor).multiplyScalar(Y),n.hemi[M]=$,M++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let z=n.hash;(z.sunLength!==m||z.directionalLength!==p||z.pointLength!==d||z.spotLength!==w||z.rectAreaLength!==D||z.hemiLength!==M||z.numSunShadows!==x||z.numDirectionalShadows!==b||z.numPointShadows!==T||z.numSpotShadows!==P||z.numSpotMaps!==_||z.numLightProbes!==L)&&(n.sun.length=m,n.directional.length=p,n.spot.length=w,n.rectArea.length=D,n.point.length=d,n.hemi.length=M,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=S,n.sunShadowCascade.length=S,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.directionalShadowMatrix.length=b,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=P,n.spotShadowMap.length=P,n.spotLightMatrix.length=P+_-E,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=L,z.sunLength=m,z.directionalLength=p,z.pointLength=d,z.spotLength=w,z.rectAreaLength=D,z.hemiLength=M,z.numSunShadows=x,z.numDirectionalShadows=b,z.numPointShadows=T,z.numSpotShadows=P,z.numSpotMaps=_,z.numLightProbes=L,n.version=m0++)}function l(c,u){let f=0,h=0,m=0,x=0,S=0,p=0,d=u.matrixWorldInverse;for(let w=0,D=c.length;w<D;w++){let M=c[w];if(M.isSunLight){let b=n.sun[f];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(d),f++}else if(M.isDirectionalLight){let b=n.directional[h];b.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),h++}else if(M.isSpotLight){let b=n.spot[x];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(d),b.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),x++}else if(M.isRectAreaLight){let b=n.rectArea[S];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(d),a.identity(),r.copy(M.matrixWorld),r.premultiply(d),a.extractRotation(r),b.halfWidth.set(M.width*.5,0,0),b.halfHeight.set(0,M.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),S++}else if(M.isPointLight){let b=n.point[m];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(d),m++}else if(M.isHemisphereLight){let b=n.hemi[p];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(d),p++}}}return{setup:o,setupView:l,state:n}}function Au(i){let t=new _0(i),e=[],n=[],s=[];function r(h){f.camera=h,e.length=0,n.length=0,s.length=0}function a(h){e.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){t.setup(e)}function u(h){t.setupView(e,h)}let f={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function x0(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Au(i),t.set(s,[o])):r>=a.length?(o=new Au(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var y0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,v0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,M0=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],S0=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Ru=new Ee,$r=new I,Rc=new I;function b0(i,t,e){let n=new Zs,s=new Ft,r=new Ft,a=new Oe,o=new Qa,l=new to,c={},u=e.maxTextureSize,f={[pi]:an,[an]:pi,[Ye]:Ye},h=new Un({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ft},radius:{value:4}},vertexShader:y0,fragmentShader:v0}),m=h.clone();m.defines.HORIZONTAL_PASS=1;let x=new Te;x.setAttribute("position",new ke(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new de(x,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=us;let d=this.type;this.render=function(T,P,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||T.length===0)return;this.type===Sh&&($t("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=us);let E=i.getRenderTarget(),L=i.getActiveCubeFace(),z=i.getActiveMipmapLevel(),H=i.state;H.setBlending(mi),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let G=d!==this.type;G&&P.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(Z=>Z.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,Z=T.length;U<Z;U++){let Y=T[U],nt=Y.shadow;if(nt===void 0){$t("WebGLShadowMap:",Y,"has no shadow.");continue}if(nt.autoUpdate===!1&&nt.needsUpdate===!1)continue;s.copy(nt.mapSize);let j=nt.getFrameExtents();s.multiply(j),r.copy(nt.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/j.x),s.x=r.x*j.x,nt.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/j.y),s.y=r.y*j.y,nt.mapSize.y=r.y));let $=i.state.buffers.depth.getReversed();if(nt.camera._reversedDepth=$,nt.map===null||G===!0){if(nt.map!==null&&(nt.map.depthTexture!==null&&(nt.map.depthTexture.dispose(),nt.map.depthTexture=null),nt.map.dispose()),this.type===er){if(Y.isPointLight){$t("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}nt.map=new vn(s.x,s.y,{format:$i,type:si,minFilter:cn,magFilter:cn,generateMipmaps:!1}),nt.map.texture.name=Y.name+".shadowMap",nt.map.depthTexture=new ki(s.x,s.y,Wn),nt.map.depthTexture.name=Y.name+".shadowMapDepth",nt.map.depthTexture.format=di,nt.map.depthTexture.compareFunction=null,nt.map.depthTexture.minFilter=sn,nt.map.depthTexture.magFilter=sn}else Y.isPointLight?(nt.map=new ol(s.x),nt.map.depthTexture=new $a(s.x,ii)):(nt.map=new vn(s.x,s.y),nt.map.depthTexture=new ki(s.x,s.y,ii)),nt.map.depthTexture.name=Y.name+".shadowMap",nt.map.depthTexture.format=di,this.type===us?(nt.map.depthTexture.compareFunction=$?il:nl,nt.map.depthTexture.minFilter=cn,nt.map.depthTexture.magFilter=cn):(nt.map.depthTexture.compareFunction=null,nt.map.depthTexture.minFilter=sn,nt.map.depthTexture.magFilter=sn);nt.camera.updateProjectionMatrix()}nt.map.isWebGLCubeRenderTarget!==!0&&(nt.map.width!==s.x||nt.map.height!==s.y)&&nt.map.setSize(s.x,s.y);let st=nt.map.isWebGLCubeRenderTarget?6:nt.getViewportCount();Y.isPointLight!==!0&&nt.updateMatrices(Y,_);for(let W=0;W<st;W++){let Nt=nt.getCamera(W);if(Y.isPointLight){let ct=nt.camera,ve=nt.matrix,ge=Y.distance||ct.far;ge!==ct.far&&(ct.far=ge,ct.updateProjectionMatrix()),$r.setFromMatrixPosition(Y.matrixWorld),ct.position.copy($r),Rc.copy(ct.position),Rc.add(M0[W]),ct.up.copy(S0[W]),ct.lookAt(Rc),ct.updateMatrixWorld(),ve.makeTranslation(-$r.x,-$r.y,-$r.z),Ru.multiplyMatrices(ct.projectionMatrix,ct.matrixWorldInverse),nt._frustum.setFromProjectionMatrix(Ru,ct.coordinateSystem,ct.reversedDepth)}if(nt.map.isWebGLCubeRenderTarget)i.setRenderTarget(nt.map,W),i.clear();else{W===0&&(i.setRenderTarget(nt.map),i.clear());let ct=nt.getViewport(W);a.set(r.x*ct.x,r.y*ct.y,r.x*ct.z,r.y*ct.w),H.viewport(a)}n=nt.getFrustum(W),M(P,_,Nt,Y,this.type)}nt.isPointLightShadow!==!0&&this.type===er&&w(nt,_),nt.needsUpdate=!1}d=this.type,p.needsUpdate=!1,i.setRenderTarget(E,L,z)};function w(T,P){let _=t.update(S);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,m.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,m.needsUpdate=!0),T.mapPass===null?T.mapPass=new vn(s.x,s.y,{format:$i,type:si}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),h.uniforms.shadow_pass.value=T.map.depthTexture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(P,null,_,h,S,null),m.uniforms.shadow_pass.value=T.mapPass.texture,m.uniforms.resolution.value.set(T.map.width,T.map.height),m.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(P,null,_,m,S,null)}function D(T,P,_,E){let L=null,z=_.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(z!==void 0)L=z;else if(L=_.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let H=L.uuid,G=P.uuid,U=c[H];U===void 0&&(U={},c[H]=U);let Z=U[G];Z===void 0&&(Z=L.clone(),U[G]=Z,P.addEventListener("dispose",b)),L=Z}if(L.visible=P.visible,L.wireframe=P.wireframe,E===er?L.side=P.shadowSide!==null?P.shadowSide:P.side:L.side=P.shadowSide!==null?P.shadowSide:f[P.side],L.alphaMap=P.alphaMap,L.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,L.map=P.map,L.clipShadows=P.clipShadows,L.clippingPlanes=P.clippingPlanes,L.clipIntersection=P.clipIntersection,L.displacementMap=P.displacementMap,L.displacementScale=P.displacementScale,L.displacementBias=P.displacementBias,L.wireframeLinewidth=P.wireframeLinewidth,L.linewidth=P.linewidth,_.isPointLight===!0&&L.isMeshDistanceMaterial===!0){let H=i.properties.get(L);H.light=_}return L}function M(T,P,_,E,L){if(T.visible===!1)return;if(T.layers.test(P.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&L===er)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,T.matrixWorld);let G=t.update(T),U=T.material;if(Array.isArray(U)){let Z=G.groups;for(let Y=0,nt=Z.length;Y<nt;Y++){let j=Z[Y],$=U[j.materialIndex];if($&&$.visible){let st=D(T,$,E,L);T.onBeforeShadow(i,T,P,_,G,st,j),i.renderBufferDirect(_,null,G,st,T,j),T.onAfterShadow(i,T,P,_,G,st,j)}}}else if(U.visible){let Z=D(T,U,E,L);T.onBeforeShadow(i,T,P,_,G,Z,null),i.renderBufferDirect(_,null,G,Z,T,null),T.onAfterShadow(i,T,P,_,G,Z,null)}}let H=T.children;for(let G=0,U=H.length;G<U;G++)M(H[G],P,_,E,L)}function b(T){T.target.removeEventListener("dispose",b);for(let _ in c){let E=c[_],L=T.target.uuid;L in E&&(E[L].dispose(),delete E[L])}}}function E0(i,t){function e(){let B=!1,bt=new Oe,dt=null,Et=new Oe(0,0,0,0);return{setMask:function(Rt){dt!==Rt&&!B&&(i.colorMask(Rt,Rt,Rt,Rt),dt=Rt)},setLocked:function(Rt){B=Rt},setClear:function(Rt,mt,Jt,Ht,Re){Re===!0&&(Rt*=Ht,mt*=Ht,Jt*=Ht),bt.set(Rt,mt,Jt,Ht),Et.equals(bt)===!1&&(i.clearColor(Rt,mt,Jt,Ht),Et.copy(bt))},reset:function(){B=!1,dt=null,Et.set(-1,0,0,0)}}}function n(){let B=!1,bt=!1,dt=null,Et=null,Rt=null;return{setReversed:function(mt){if(bt!==mt){let Jt=t.get("EXT_clip_control");mt?Jt.clipControlEXT(Jt.LOWER_LEFT_EXT,Jt.ZERO_TO_ONE_EXT):Jt.clipControlEXT(Jt.LOWER_LEFT_EXT,Jt.NEGATIVE_ONE_TO_ONE_EXT),bt=mt;let Ht=Rt;Rt=null,this.setClear(Ht)}},getReversed:function(){return bt},setTest:function(mt){mt?pt(i.DEPTH_TEST):Bt(i.DEPTH_TEST)},setMask:function(mt){dt!==mt&&!B&&(i.depthMask(mt),dt=mt)},setFunc:function(mt){if(bt&&(mt=nu[mt]),Et!==mt){switch(mt){case Fa:i.depthFunc(i.NEVER);break;case Oa:i.depthFunc(i.ALWAYS);break;case Ba:i.depthFunc(i.LESS);break;case Os:i.depthFunc(i.LEQUAL);break;case za:i.depthFunc(i.EQUAL);break;case ka:i.depthFunc(i.GEQUAL);break;case Ha:i.depthFunc(i.GREATER);break;case Va:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Et=mt}},setLocked:function(mt){B=mt},setClear:function(mt){Rt!==mt&&(Rt=mt,bt&&(mt=1-mt),i.clearDepth(mt))},reset:function(){B=!1,dt=null,Et=null,Rt=null,bt=!1}}}function s(){let B=!1,bt=null,dt=null,Et=null,Rt=null,mt=null,Jt=null,Ht=null,Re=null;return{setTest:function(Se){B||(Se?pt(i.STENCIL_TEST):Bt(i.STENCIL_TEST))},setMask:function(Se){bt!==Se&&!B&&(i.stencilMask(Se),bt=Se)},setFunc:function(Se,En,Tn){(dt!==Se||Et!==En||Rt!==Tn)&&(i.stencilFunc(Se,En,Tn),dt=Se,Et=En,Rt=Tn)},setOp:function(Se,En,Tn){(mt!==Se||Jt!==En||Ht!==Tn)&&(i.stencilOp(Se,En,Tn),mt=Se,Jt=En,Ht=Tn)},setLocked:function(Se){B=Se},setClear:function(Se){Re!==Se&&(i.clearStencil(Se),Re=Se)},reset:function(){B=!1,bt=null,dt=null,Et=null,Rt=null,mt=null,Jt=null,Ht=null,Re=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},f={},h={},m=new WeakMap,x=[],S=null,p=!1,d=null,w=null,D=null,M=null,b=null,T=null,P=null,_=new Ot(0,0,0),E=0,L=!1,z=null,H=null,G=null,U=null,Z=null,Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),nt=!1,j=0,$=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec($)[1]),nt=j>=1):$.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),nt=j>=2);let st=null,W={},Nt=i.getParameter(i.SCISSOR_BOX),ct=i.getParameter(i.VIEWPORT),ve=new Oe().fromArray(Nt),ge=new Oe().fromArray(ct);function zt(B,bt,dt,Et){let Rt=new Uint8Array(4),mt=i.createTexture();i.bindTexture(B,mt),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Jt=0;Jt<dt;Jt++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(bt,0,i.RGBA,1,1,Et,0,i.RGBA,i.UNSIGNED_BYTE,Rt):i.texImage2D(bt+Jt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Rt);return mt}let ot={};ot[i.TEXTURE_2D]=zt(i.TEXTURE_2D,i.TEXTURE_2D,1),ot[i.TEXTURE_CUBE_MAP]=zt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ot[i.TEXTURE_2D_ARRAY]=zt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ot[i.TEXTURE_3D]=zt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),pt(i.DEPTH_TEST),a.setFunc(Os),he(!1),ye(Zl),pt(i.CULL_FACE),xe(mi);function pt(B){u[B]!==!0&&(i.enable(B),u[B]=!0)}function Bt(B){u[B]!==!1&&(i.disable(B),u[B]=!1)}function te(B,bt){return h[B]!==bt?(i.bindFramebuffer(B,bt),h[B]=bt,B===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=bt),B===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=bt),!0):!1}function At(B,bt){let dt=x,Et=!1;if(B){dt=m.get(bt),dt===void 0&&(dt=[],m.set(bt,dt));let Rt=B.textures;if(dt.length!==Rt.length||dt[0]!==i.COLOR_ATTACHMENT0){for(let mt=0,Jt=Rt.length;mt<Jt;mt++)dt[mt]=i.COLOR_ATTACHMENT0+mt;dt.length=Rt.length,Et=!0}}else dt[0]!==i.BACK&&(dt[0]=i.BACK,Et=!0);Et&&i.drawBuffers(dt)}function ee(B){return S!==B?(i.useProgram(B),S=B,!0):!1}let Ge={[ds]:i.FUNC_ADD,[Eh]:i.FUNC_SUBTRACT,[Th]:i.FUNC_REVERSE_SUBTRACT};Ge[wh]=i.MIN,Ge[Ah]=i.MAX;let ce={[Rh]:i.ZERO,[Ch]:i.ONE,[Ph]:i.SRC_COLOR,[jl]:i.SRC_ALPHA,[Fh]:i.SRC_ALPHA_SATURATE,[Nh]:i.DST_COLOR,[Lh]:i.DST_ALPHA,[Ih]:i.ONE_MINUS_SRC_COLOR,[Ql]:i.ONE_MINUS_SRC_ALPHA,[Uh]:i.ONE_MINUS_DST_COLOR,[Dh]:i.ONE_MINUS_DST_ALPHA,[Oh]:i.CONSTANT_COLOR,[Bh]:i.ONE_MINUS_CONSTANT_COLOR,[zh]:i.CONSTANT_ALPHA,[kh]:i.ONE_MINUS_CONSTANT_ALPHA};function xe(B,bt,dt,Et,Rt,mt,Jt,Ht,Re,Se){if(B===mi){p===!0&&(Bt(i.BLEND),p=!1);return}if(p===!1&&(pt(i.BLEND),p=!0),B!==bh){if(B!==d||Se!==L){if((w!==ds||b!==ds)&&(i.blendEquation(i.FUNC_ADD),w=ds,b=ds),Se)switch(B){case nr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFunc(i.ONE,i.ONE);break;case Kl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case $l:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Qt("WebGLState: Invalid blending: ",B);break}else switch(B){case nr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Kl:Qt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case $l:Qt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qt("WebGLState: Invalid blending: ",B);break}D=null,M=null,T=null,P=null,_.set(0,0,0),E=0,d=B,L=Se}return}Rt=Rt||bt,mt=mt||dt,Jt=Jt||Et,(bt!==w||Rt!==b)&&(i.blendEquationSeparate(Ge[bt],Ge[Rt]),w=bt,b=Rt),(dt!==D||Et!==M||mt!==T||Jt!==P)&&(i.blendFuncSeparate(ce[dt],ce[Et],ce[mt],ce[Jt]),D=dt,M=Et,T=mt,P=Jt),(Ht.equals(_)===!1||Re!==E)&&(i.blendColor(Ht.r,Ht.g,Ht.b,Re),_.copy(Ht),E=Re),d=B,L=!1}function Ae(B,bt){B.side===Ye?Bt(i.CULL_FACE):pt(i.CULL_FACE);let dt=B.side===an;bt&&(dt=!dt),he(dt),B.blending===nr&&B.transparent===!1?xe(mi):xe(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);let Et=B.stencilWrite;o.setTest(Et),Et&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ke(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?pt(i.SAMPLE_ALPHA_TO_COVERAGE):Bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function he(B){z!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),z=B)}function ye(B){B!==vh?(pt(i.CULL_FACE),B!==H&&(B===Zl?i.cullFace(i.BACK):B===Mh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Bt(i.CULL_FACE),H=B}function We(B){B!==G&&(nt&&i.lineWidth(B),G=B)}function Ke(B,bt,dt){B?(pt(i.POLYGON_OFFSET_FILL),(U!==bt||Z!==dt)&&(U=bt,Z=dt,a.getReversed()&&(bt=-bt),i.polygonOffset(bt,dt))):Bt(i.POLYGON_OFFSET_FILL)}function Ne(B){B?pt(i.SCISSOR_TEST):Bt(i.SCISSOR_TEST)}function Be(B){B===void 0&&(B=i.TEXTURE0+Y-1),st!==B&&(i.activeTexture(B),st=B)}function O(B,bt,dt){dt===void 0&&(st===null?dt=i.TEXTURE0+Y-1:dt=st);let Et=W[dt];Et===void 0&&(Et={type:void 0,texture:void 0},W[dt]=Et),(Et.type!==B||Et.texture!==bt)&&(st!==dt&&(i.activeTexture(dt),st=dt),i.bindTexture(B,bt||ot[B]),Et.type=B,Et.texture=bt)}function Wt(){let B=W[st];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function Me(){try{i.compressedTexImage2D(...arguments)}catch(B){Qt("WebGLState:",B)}}function A(){try{i.compressedTexImage3D(...arguments)}catch(B){Qt("WebGLState:",B)}}function g(){try{i.texSubImage2D(...arguments)}catch(B){Qt("WebGLState:",B)}}function X(){try{i.texSubImage3D(...arguments)}catch(B){Qt("WebGLState:",B)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Qt("WebGLState:",B)}}function rt(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Qt("WebGLState:",B)}}function _t(){try{i.texStorage2D(...arguments)}catch(B){Qt("WebGLState:",B)}}function xt(){try{i.texStorage3D(...arguments)}catch(B){Qt("WebGLState:",B)}}function at(){try{i.texImage2D(...arguments)}catch(B){Qt("WebGLState:",B)}}function ft(){try{i.texImage3D(...arguments)}catch(B){Qt("WebGLState:",B)}}function vt(B){return f[B]!==void 0?f[B]:i.getParameter(B)}function Yt(B,bt){f[B]!==bt&&(i.pixelStorei(B,bt),f[B]=bt)}function wt(B){ve.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),ve.copy(B))}function Mt(B){ge.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),ge.copy(B))}function Zt(B,bt){let dt=c.get(bt);dt===void 0&&(dt=new WeakMap,c.set(bt,dt));let Et=dt.get(B);Et===void 0&&(Et=i.getUniformBlockIndex(bt,B.name),dt.set(B,Et))}function Kt(B,bt){let Et=c.get(bt).get(B);l.get(bt)!==Et&&(i.uniformBlockBinding(bt,Et,B.__bindingPointIndex),l.set(bt,Et))}function re(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},st=null,W={},h={},m=new WeakMap,x=[],S=null,p=!1,d=null,w=null,D=null,M=null,b=null,T=null,P=null,_=new Ot(0,0,0),E=0,L=!1,z=null,H=null,G=null,U=null,Z=null,ve.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:pt,disable:Bt,bindFramebuffer:te,drawBuffers:At,useProgram:ee,setBlending:xe,setMaterial:Ae,setFlipSided:he,setCullFace:ye,setLineWidth:We,setPolygonOffset:Ke,setScissorTest:Ne,activeTexture:Be,bindTexture:O,unbindTexture:Wt,compressedTexImage2D:Me,compressedTexImage3D:A,texImage2D:at,texImage3D:ft,pixelStorei:Yt,getParameter:vt,updateUBOMapping:Zt,uniformBlockBinding:Kt,texStorage2D:_t,texStorage3D:xt,texSubImage2D:g,texSubImage3D:X,compressedTexSubImage2D:K,compressedTexSubImage3D:rt,scissor:wt,viewport:Mt,reset:re}}function T0(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ft,u=new WeakMap,f=new Set,h,m=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(A,g){return x?new OffscreenCanvas(A,g):wr("canvas")}function p(A,g,X){let K=1,rt=Me(A);if((rt.width>X||rt.height>X)&&(K=X/Math.max(rt.width,rt.height)),K<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let _t=Math.floor(K*rt.width),xt=Math.floor(K*rt.height);h===void 0&&(h=S(_t,xt));let at=g?S(_t,xt):h;return at.width=_t,at.height=xt,at.getContext("2d").drawImage(A,0,0,_t,xt),$t("WebGLRenderer: Texture has been resized from ("+rt.width+"x"+rt.height+") to ("+_t+"x"+xt+")."),at}else return"data"in A&&$t("WebGLRenderer: Image in DataTexture is too big ("+rt.width+"x"+rt.height+")."),A;return A}function d(A){return A.generateMipmaps}function w(A){i.generateMipmap(A)}function D(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(A,g,X,K,rt,_t=!1){if(A!==null){if(i[A]!==void 0)return i[A];$t("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let xt;K&&(xt=t.get("EXT_texture_norm16"),xt||$t("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let at=g;if(g===i.RED&&(X===i.FLOAT&&(at=i.R32F),X===i.HALF_FLOAT&&(at=i.R16F),X===i.UNSIGNED_BYTE&&(at=i.R8),X===i.UNSIGNED_SHORT&&xt&&(at=xt.R16_EXT),X===i.SHORT&&xt&&(at=xt.R16_SNORM_EXT)),g===i.RED_INTEGER&&(X===i.UNSIGNED_BYTE&&(at=i.R8UI),X===i.UNSIGNED_SHORT&&(at=i.R16UI),X===i.UNSIGNED_INT&&(at=i.R32UI),X===i.BYTE&&(at=i.R8I),X===i.SHORT&&(at=i.R16I),X===i.INT&&(at=i.R32I)),g===i.RG&&(X===i.FLOAT&&(at=i.RG32F),X===i.HALF_FLOAT&&(at=i.RG16F),X===i.UNSIGNED_BYTE&&(at=i.RG8),X===i.UNSIGNED_SHORT&&xt&&(at=xt.RG16_EXT),X===i.SHORT&&xt&&(at=xt.RG16_SNORM_EXT)),g===i.RG_INTEGER&&(X===i.UNSIGNED_BYTE&&(at=i.RG8UI),X===i.UNSIGNED_SHORT&&(at=i.RG16UI),X===i.UNSIGNED_INT&&(at=i.RG32UI),X===i.BYTE&&(at=i.RG8I),X===i.SHORT&&(at=i.RG16I),X===i.INT&&(at=i.RG32I)),g===i.RGB_INTEGER&&(X===i.UNSIGNED_BYTE&&(at=i.RGB8UI),X===i.UNSIGNED_SHORT&&(at=i.RGB16UI),X===i.UNSIGNED_INT&&(at=i.RGB32UI),X===i.BYTE&&(at=i.RGB8I),X===i.SHORT&&(at=i.RGB16I),X===i.INT&&(at=i.RGB32I)),g===i.RGBA_INTEGER&&(X===i.UNSIGNED_BYTE&&(at=i.RGBA8UI),X===i.UNSIGNED_SHORT&&(at=i.RGBA16UI),X===i.UNSIGNED_INT&&(at=i.RGBA32UI),X===i.BYTE&&(at=i.RGBA8I),X===i.SHORT&&(at=i.RGBA16I),X===i.INT&&(at=i.RGBA32I)),g===i.RGB&&(X===i.UNSIGNED_SHORT&&xt&&(at=xt.RGB16_EXT),X===i.SHORT&&xt&&(at=xt.RGB16_SNORM_EXT),X===i.UNSIGNED_INT_5_9_9_9_REV&&(at=i.RGB9_E5),X===i.UNSIGNED_INT_10F_11F_11F_REV&&(at=i.R11F_G11F_B10F)),g===i.RGBA){let ft=_t?Tr:_e.getTransfer(rt);X===i.FLOAT&&(at=i.RGBA32F),X===i.HALF_FLOAT&&(at=i.RGBA16F),X===i.UNSIGNED_BYTE&&(at=ft===Pe?i.SRGB8_ALPHA8:i.RGBA8),X===i.UNSIGNED_SHORT&&xt&&(at=xt.RGBA16_EXT),X===i.SHORT&&xt&&(at=xt.RGBA16_SNORM_EXT),X===i.UNSIGNED_SHORT_4_4_4_4&&(at=i.RGBA4),X===i.UNSIGNED_SHORT_5_5_5_1&&(at=i.RGB5_A1)}return(at===i.R16F||at===i.R32F||at===i.RG16F||at===i.RG32F||at===i.RGBA16F||at===i.RGBA32F)&&t.get("EXT_color_buffer_float"),at}function b(A,g){let X;return A?g===null||g===ii||g===sr?X=i.DEPTH24_STENCIL8:g===Wn?X=i.DEPTH32F_STENCIL8:g===ir&&(X=i.DEPTH24_STENCIL8,$t("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===ii||g===sr?X=i.DEPTH_COMPONENT24:g===Wn?X=i.DEPTH_COMPONENT32F:g===ir&&(X=i.DEPTH_COMPONENT16),X}function T(A,g){return d(A)===!0||A.isFramebufferTexture&&A.minFilter!==sn&&A.minFilter!==cn?Math.log2(Math.max(g.width,g.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?g.mipmaps.length:1}function P(A){let g=A.target;g.removeEventListener("dispose",P),E(g),g.isVideoTexture&&u.delete(g),g.isHTMLTexture&&f.delete(g)}function _(A){let g=A.target;g.removeEventListener("dispose",_),z(g)}function E(A){let g=n.get(A);if(g.__webglInit===void 0)return;let X=A.source,K=m.get(X);if(K){let rt=K[g.__cacheKey];rt.usedTimes--,rt.usedTimes===0&&L(A),Object.keys(K).length===0&&m.delete(X)}n.remove(A)}function L(A){let g=n.get(A);i.deleteTexture(g.__webglTexture);let X=A.source,K=m.get(X);delete K[g.__cacheKey],a.memory.textures--}function z(A){let g=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(g.__webglFramebuffer[K]))for(let rt=0;rt<g.__webglFramebuffer[K].length;rt++)i.deleteFramebuffer(g.__webglFramebuffer[K][rt]);else i.deleteFramebuffer(g.__webglFramebuffer[K]);g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer[K])}else{if(Array.isArray(g.__webglFramebuffer))for(let K=0;K<g.__webglFramebuffer.length;K++)i.deleteFramebuffer(g.__webglFramebuffer[K]);else i.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&i.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let K=0;K<g.__webglColorRenderbuffer.length;K++)g.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(g.__webglColorRenderbuffer[K]);g.__webglDepthRenderbuffer&&i.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let X=A.textures;for(let K=0,rt=X.length;K<rt;K++){let _t=n.get(X[K]);_t.__webglTexture&&(i.deleteTexture(_t.__webglTexture),a.memory.textures--),n.remove(X[K])}n.remove(A)}let H=0;function G(){H=0}function U(){return H}function Z(A){H=A}function Y(){let A=H;return A>=s.maxTextures&&$t("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),H+=1,A}function nt(A){let g=[];return g.push(A.wrapS),g.push(A.wrapT),g.push(A.wrapR||0),g.push(A.magFilter),g.push(A.minFilter),g.push(A.anisotropy),g.push(A.internalFormat),g.push(A.format),g.push(A.type),g.push(A.generateMipmaps),g.push(A.premultiplyAlpha),g.push(A.flipY),g.push(A.unpackAlignment),g.push(A.colorSpace),g.join()}function j(A,g){let X=n.get(A);if(A.isVideoTexture&&O(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&X.__version!==A.version){let K=A.image;if(K===null)$t("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)$t("WebGLRenderer: Texture marked for update but image is incomplete");else{Bt(X,A,g);return}}else A.isExternalTexture&&(X.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,X.__webglTexture,i.TEXTURE0+g)}function $(A,g){let X=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&X.__version!==A.version){Bt(X,A,g);return}else A.isExternalTexture&&(X.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,X.__webglTexture,i.TEXTURE0+g)}function st(A,g){let X=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&X.__version!==A.version){Bt(X,A,g);return}e.bindTexture(i.TEXTURE_3D,X.__webglTexture,i.TEXTURE0+g)}function W(A,g){let X=n.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&X.__version!==A.version){te(X,A,g);return}e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture,i.TEXTURE0+g)}let Nt={[Ga]:i.REPEAT,[ui]:i.CLAMP_TO_EDGE,[Wa]:i.MIRRORED_REPEAT},ct={[sn]:i.NEAREST,[Gh]:i.NEAREST_MIPMAP_NEAREST,[Gr]:i.NEAREST_MIPMAP_LINEAR,[cn]:i.LINEAR,[_o]:i.LINEAR_MIPMAP_NEAREST,[Ji]:i.LINEAR_MIPMAP_LINEAR},ve={[Yh]:i.NEVER,[jh]:i.ALWAYS,[Zh]:i.LESS,[nl]:i.LEQUAL,[Jh]:i.EQUAL,[il]:i.GEQUAL,[Kh]:i.GREATER,[$h]:i.NOTEQUAL};function ge(A,g){if(g.type===Wn&&t.has("OES_texture_float_linear")===!1&&(g.magFilter===cn||g.magFilter===_o||g.magFilter===Gr||g.magFilter===Ji||g.minFilter===cn||g.minFilter===_o||g.minFilter===Gr||g.minFilter===Ji)&&$t("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Nt[g.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Nt[g.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Nt[g.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,ct[g.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,ct[g.minFilter]),g.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ve[g.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===sn||g.minFilter!==Gr&&g.minFilter!==Ji||g.type===Wn&&t.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||n.get(g).__currentAnisotropy){let X=t.get("EXT_texture_filter_anisotropic");i.texParameterf(A,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),n.get(g).__currentAnisotropy=g.anisotropy}}}function zt(A,g){let X=!1;A.__webglInit===void 0&&(A.__webglInit=!0,g.addEventListener("dispose",P));let K=g.source,rt=m.get(K);rt===void 0&&(rt={},m.set(K,rt));let _t=nt(g);if(_t!==A.__cacheKey){rt[_t]===void 0&&(rt[_t]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,X=!0),rt[_t].usedTimes++;let xt=rt[A.__cacheKey];xt!==void 0&&(rt[A.__cacheKey].usedTimes--,xt.usedTimes===0&&L(g)),A.__cacheKey=_t,A.__webglTexture=rt[_t].texture}return X}function ot(A,g,X){return Math.floor(Math.floor(A/X)/g)}function pt(A,g,X,K){let _t=A.updateRanges;if(_t.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,g.width,g.height,X,K,g.data);else{_t.sort((Yt,wt)=>Yt.start-wt.start);let xt=0;for(let Yt=1;Yt<_t.length;Yt++){let wt=_t[xt],Mt=_t[Yt],Zt=wt.start+wt.count,Kt=ot(Mt.start,g.width,4),re=ot(wt.start,g.width,4);Mt.start<=Zt+1&&Kt===re&&ot(Mt.start+Mt.count-1,g.width,4)===Kt?wt.count=Math.max(wt.count,Mt.start+Mt.count-wt.start):(++xt,_t[xt]=Mt)}_t.length=xt+1;let at=e.getParameter(i.UNPACK_ROW_LENGTH),ft=e.getParameter(i.UNPACK_SKIP_PIXELS),vt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,g.width);for(let Yt=0,wt=_t.length;Yt<wt;Yt++){let Mt=_t[Yt],Zt=Math.floor(Mt.start/4),Kt=Math.ceil(Mt.count/4),re=Zt%g.width,B=Math.floor(Zt/g.width),bt=Kt,dt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,re),e.pixelStorei(i.UNPACK_SKIP_ROWS,B),e.texSubImage2D(i.TEXTURE_2D,0,re,B,bt,dt,X,K,g.data)}A.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,at),e.pixelStorei(i.UNPACK_SKIP_PIXELS,ft),e.pixelStorei(i.UNPACK_SKIP_ROWS,vt)}}function Bt(A,g,X){let K=i.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),g.isData3DTexture&&(K=i.TEXTURE_3D);let rt=zt(A,g),_t=g.source;e.bindTexture(K,A.__webglTexture,i.TEXTURE0+X);let xt=n.get(_t);if(_t.version!==xt.__version||rt===!0){if(e.activeTexture(i.TEXTURE0+X),(typeof ImageBitmap<"u"&&g.image instanceof ImageBitmap)===!1){let dt=_e.getPrimaries(_e.workingColorSpace),Et=g.colorSpace===Pi?null:_e.getPrimaries(g.colorSpace),Rt=g.colorSpace===Pi||dt===Et?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Rt)}e.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment);let ft=p(g.image,!1,s.maxTextureSize);ft=Wt(g,ft);let vt=r.convert(g.format,g.colorSpace),Yt=r.convert(g.type),wt=M(g.internalFormat,vt,Yt,g.normalized,g.colorSpace,g.isVideoTexture);ge(K,g);let Mt,Zt=g.mipmaps,Kt=g.isVideoTexture!==!0,re=xt.__version===void 0||rt===!0,B=_t.dataReady,bt=T(g,ft);if(g.isDepthTexture)wt=b(g.format===Ki,g.type),re&&(Kt?e.texStorage2D(i.TEXTURE_2D,1,wt,ft.width,ft.height):e.texImage2D(i.TEXTURE_2D,0,wt,ft.width,ft.height,0,vt,Yt,null));else if(g.isDataTexture)if(Zt.length>0){Kt&&re&&e.texStorage2D(i.TEXTURE_2D,bt,wt,Zt[0].width,Zt[0].height);for(let dt=0,Et=Zt.length;dt<Et;dt++)Mt=Zt[dt],Kt?B&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,Mt.width,Mt.height,vt,Yt,Mt.data):e.texImage2D(i.TEXTURE_2D,dt,wt,Mt.width,Mt.height,0,vt,Yt,Mt.data);g.generateMipmaps=!1}else Kt?(re&&e.texStorage2D(i.TEXTURE_2D,bt,wt,ft.width,ft.height),B&&pt(g,ft,vt,Yt)):e.texImage2D(i.TEXTURE_2D,0,wt,ft.width,ft.height,0,vt,Yt,ft.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){Kt&&re&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,wt,Zt[0].width,Zt[0].height,ft.depth);for(let dt=0,Et=Zt.length;dt<Et;dt++)if(Mt=Zt[dt],g.format!==Xn)if(vt!==null)if(Kt){if(B)if(g.layerUpdates.size>0){let Rt=Sc(Mt.width,Mt.height,g.format,g.type);for(let mt of g.layerUpdates){let Jt=Mt.data.subarray(mt*Rt/Mt.data.BYTES_PER_ELEMENT,(mt+1)*Rt/Mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,mt,Mt.width,Mt.height,1,vt,Jt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,0,Mt.width,Mt.height,ft.depth,vt,Mt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,dt,wt,Mt.width,Mt.height,ft.depth,0,Mt.data,0,0);else $t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Kt?B&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,0,Mt.width,Mt.height,ft.depth,vt,Yt,Mt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,dt,wt,Mt.width,Mt.height,ft.depth,0,vt,Yt,Mt.data);g.layerUpdates.size>0&&g.clearLayerUpdates()}else{Kt&&re&&e.texStorage2D(i.TEXTURE_2D,bt,wt,Zt[0].width,Zt[0].height);for(let dt=0,Et=Zt.length;dt<Et;dt++)Mt=Zt[dt],g.format!==Xn?vt!==null?Kt?B&&e.compressedTexSubImage2D(i.TEXTURE_2D,dt,0,0,Mt.width,Mt.height,vt,Mt.data):e.compressedTexImage2D(i.TEXTURE_2D,dt,wt,Mt.width,Mt.height,0,Mt.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Kt?B&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,Mt.width,Mt.height,vt,Yt,Mt.data):e.texImage2D(i.TEXTURE_2D,dt,wt,Mt.width,Mt.height,0,vt,Yt,Mt.data)}else if(g.isDataArrayTexture)if(Kt){if(re&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,wt,ft.width,ft.height,ft.depth),B)if(g.layerUpdates.size>0){let dt=Sc(ft.width,ft.height,g.format,g.type);for(let Et of g.layerUpdates){let Rt=ft.data.subarray(Et*dt/ft.data.BYTES_PER_ELEMENT,(Et+1)*dt/ft.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Et,ft.width,ft.height,1,vt,Yt,Rt)}g.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ft.width,ft.height,ft.depth,vt,Yt,ft.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,wt,ft.width,ft.height,ft.depth,0,vt,Yt,ft.data);else if(g.isData3DTexture)Kt?(re&&e.texStorage3D(i.TEXTURE_3D,bt,wt,ft.width,ft.height,ft.depth),B&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ft.width,ft.height,ft.depth,vt,Yt,ft.data)):e.texImage3D(i.TEXTURE_3D,0,wt,ft.width,ft.height,ft.depth,0,vt,Yt,ft.data);else if(g.isFramebufferTexture){if(re)if(Kt)e.texStorage2D(i.TEXTURE_2D,bt,wt,ft.width,ft.height);else{let dt=ft.width,Et=ft.height;for(let Rt=0;Rt<bt;Rt++)e.texImage2D(i.TEXTURE_2D,Rt,wt,dt,Et,0,vt,Yt,null),dt>>=1,Et>>=1}}else if(g.isHTMLTexture){if("texElementImage2D"in i){let dt=i.canvas;if(dt.hasAttribute("layoutsubtree")||dt.setAttribute("layoutsubtree","true"),ft.parentNode!==dt){dt.appendChild(ft),f.add(g),dt.onpaint=Et=>{let Rt=Et.changedElements;for(let mt of f)Rt.includes(mt.image)&&(mt.needsUpdate=!0)},dt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ft);else{let Rt=i.RGBA,mt=i.RGBA,Jt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Rt,mt,Jt,ft)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Zt.length>0){if(Kt&&re){let dt=Me(Zt[0]);e.texStorage2D(i.TEXTURE_2D,bt,wt,dt.width,dt.height)}for(let dt=0,Et=Zt.length;dt<Et;dt++)Mt=Zt[dt],Kt?B&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,vt,Yt,Mt):e.texImage2D(i.TEXTURE_2D,dt,wt,vt,Yt,Mt);g.generateMipmaps=!1}else if(Kt){if(re){let dt=Me(ft);e.texStorage2D(i.TEXTURE_2D,bt,wt,dt.width,dt.height)}B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,vt,Yt,ft)}else e.texImage2D(i.TEXTURE_2D,0,wt,vt,Yt,ft);d(g)&&w(K),xt.__version=_t.version,g.onUpdate&&g.onUpdate(g)}A.__version=g.version}function te(A,g,X){if(g.image.length!==6)return;let K=zt(A,g),rt=g.source;e.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+X);let _t=n.get(rt);if(rt.version!==_t.__version||K===!0){e.activeTexture(i.TEXTURE0+X);let xt=_e.getPrimaries(_e.workingColorSpace),at=g.colorSpace===Pi?null:_e.getPrimaries(g.colorSpace),ft=g.colorSpace===Pi||xt===at?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ft);let vt=g.isCompressedTexture||g.image[0].isCompressedTexture,Yt=g.image[0]&&g.image[0].isDataTexture,wt=[];for(let mt=0;mt<6;mt++)!vt&&!Yt?wt[mt]=p(g.image[mt],!0,s.maxCubemapSize):wt[mt]=Yt?g.image[mt].image:g.image[mt],wt[mt]=Wt(g,wt[mt]);let Mt=wt[0],Zt=r.convert(g.format,g.colorSpace),Kt=r.convert(g.type),re=M(g.internalFormat,Zt,Kt,g.normalized,g.colorSpace),B=g.isVideoTexture!==!0,bt=_t.__version===void 0||K===!0,dt=rt.dataReady,Et=T(g,Mt);ge(i.TEXTURE_CUBE_MAP,g);let Rt;if(vt){B&&bt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Et,re,Mt.width,Mt.height);for(let mt=0;mt<6;mt++){Rt=wt[mt].mipmaps;for(let Jt=0;Jt<Rt.length;Jt++){let Ht=Rt[Jt];g.format!==Xn?Zt!==null?B?dt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt,0,0,Ht.width,Ht.height,Zt,Ht.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt,re,Ht.width,Ht.height,0,Ht.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt,0,0,Ht.width,Ht.height,Zt,Kt,Ht.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt,re,Ht.width,Ht.height,0,Zt,Kt,Ht.data)}}}else{if(Rt=g.mipmaps,B&&bt){Rt.length>0&&Et++;let mt=Me(wt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Et,re,mt.width,mt.height)}for(let mt=0;mt<6;mt++)if(Yt){B?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,wt[mt].width,wt[mt].height,Zt,Kt,wt[mt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,re,wt[mt].width,wt[mt].height,0,Zt,Kt,wt[mt].data);for(let Jt=0;Jt<Rt.length;Jt++){let Re=Rt[Jt].image[mt].image;B?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt+1,0,0,Re.width,Re.height,Zt,Kt,Re.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt+1,re,Re.width,Re.height,0,Zt,Kt,Re.data)}}else{B?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,Zt,Kt,wt[mt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,re,Zt,Kt,wt[mt]);for(let Jt=0;Jt<Rt.length;Jt++){let Ht=Rt[Jt];B?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt+1,0,0,Zt,Kt,Ht.image[mt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,Jt+1,re,Zt,Kt,Ht.image[mt])}}}d(g)&&w(i.TEXTURE_CUBE_MAP),_t.__version=rt.version,g.onUpdate&&g.onUpdate(g)}A.__version=g.version}function At(A,g,X,K,rt,_t){let xt=r.convert(X.format,X.colorSpace),at=r.convert(X.type),ft=M(X.internalFormat,xt,at,X.normalized,X.colorSpace),vt=n.get(g),Yt=n.get(X);if(Yt.__renderTarget=g,!vt.__hasExternalTextures){let wt=Math.max(1,g.width>>_t),Mt=Math.max(1,g.height>>_t);rt===i.TEXTURE_3D||rt===i.TEXTURE_2D_ARRAY?e.texImage3D(rt,_t,ft,wt,Mt,g.depth,0,xt,at,null):e.texImage2D(rt,_t,ft,wt,Mt,0,xt,at,null)}e.bindFramebuffer(i.FRAMEBUFFER,A),Be(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,rt,Yt.__webglTexture,0,Ne(g)):(rt===i.TEXTURE_2D||rt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&rt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,rt,Yt.__webglTexture,_t),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ee(A,g,X){if(i.bindRenderbuffer(i.RENDERBUFFER,A),g.depthBuffer){let K=g.depthTexture,rt=K&&K.isDepthTexture?K.type:null,_t=b(g.stencilBuffer,rt),xt=g.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Be(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne(g),_t,g.width,g.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne(g),_t,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,_t,g.width,g.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,xt,i.RENDERBUFFER,A)}else{let K=g.textures;for(let rt=0;rt<K.length;rt++){let _t=K[rt],xt=r.convert(_t.format,_t.colorSpace),at=r.convert(_t.type),ft=M(_t.internalFormat,xt,at,_t.normalized,_t.colorSpace);Be(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne(g),ft,g.width,g.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne(g),ft,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,ft,g.width,g.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ge(A,g,X){let K=g.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,A),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let rt=n.get(g.depthTexture);if(rt.__renderTarget=g,(!rt.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),K){if(rt.__webglInit===void 0&&(rt.__webglInit=!0,g.depthTexture.addEventListener("dispose",P)),rt.__webglTexture===void 0){rt.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,rt.__webglTexture),ge(i.TEXTURE_CUBE_MAP,g.depthTexture);let vt=r.convert(g.depthTexture.format),Yt=r.convert(g.depthTexture.type),wt;g.depthTexture.format===di?wt=i.DEPTH_COMPONENT24:g.depthTexture.format===Ki&&(wt=i.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,wt,g.width,g.height,0,vt,Yt,null)}}else j(g.depthTexture,0);let _t=rt.__webglTexture,xt=Ne(g),at=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+X:i.TEXTURE_2D,ft=g.depthTexture.format===Ki?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(g.depthTexture.format===di)Be(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ft,at,_t,0,xt):i.framebufferTexture2D(i.FRAMEBUFFER,ft,at,_t,0);else if(g.depthTexture.format===Ki)Be(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ft,at,_t,0,xt):i.framebufferTexture2D(i.FRAMEBUFFER,ft,at,_t,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ce(A){let g=n.get(A),X=A.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==A.depthTexture){let K=A.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),K){let rt=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,K.removeEventListener("dispose",rt)};K.addEventListener("dispose",rt),g.__depthDisposeCallback=rt}g.__boundDepthTexture=K}if(A.depthTexture&&!g.__autoAllocateDepthBuffer)if(X)for(let K=0;K<6;K++)Ge(g.__webglFramebuffer[K],A,K);else{let K=A.texture.mipmaps;K&&K.length>0?Ge(g.__webglFramebuffer[0],A,0):Ge(g.__webglFramebuffer,A,0)}else if(X){g.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[K]),g.__webglDepthbuffer[K]===void 0)g.__webglDepthbuffer[K]=i.createRenderbuffer(),ee(g.__webglDepthbuffer[K],A,!1);else{let rt=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=g.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,rt,i.RENDERBUFFER,_t)}}else{let K=A.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=i.createRenderbuffer(),ee(g.__webglDepthbuffer,A,!1);else{let rt=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=g.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,rt,i.RENDERBUFFER,_t)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function xe(A,g,X){let K=n.get(A);g!==void 0&&At(K.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),X!==void 0&&ce(A)}function Ae(A){let g=A.texture,X=n.get(A),K=n.get(g);A.addEventListener("dispose",_);let rt=A.textures,_t=A.isWebGLCubeRenderTarget===!0,xt=rt.length>1;if(xt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=g.version,a.memory.textures++),_t){X.__webglFramebuffer=[];for(let at=0;at<6;at++)if(g.mipmaps&&g.mipmaps.length>0){X.__webglFramebuffer[at]=[];for(let ft=0;ft<g.mipmaps.length;ft++)X.__webglFramebuffer[at][ft]=i.createFramebuffer()}else X.__webglFramebuffer[at]=i.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){X.__webglFramebuffer=[];for(let at=0;at<g.mipmaps.length;at++)X.__webglFramebuffer[at]=i.createFramebuffer()}else X.__webglFramebuffer=i.createFramebuffer();if(xt)for(let at=0,ft=rt.length;at<ft;at++){let vt=n.get(rt[at]);vt.__webglTexture===void 0&&(vt.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&Be(A)===!1){X.__webglMultisampledFramebuffer=i.createFramebuffer(),X.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let at=0;at<rt.length;at++){let ft=rt[at];X.__webglColorRenderbuffer[at]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,X.__webglColorRenderbuffer[at]);let vt=r.convert(ft.format,ft.colorSpace),Yt=r.convert(ft.type),wt=M(ft.internalFormat,vt,Yt,ft.normalized,ft.colorSpace,A.isXRRenderTarget===!0),Mt=Ne(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,wt,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,X.__webglColorRenderbuffer[at])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(X.__webglDepthRenderbuffer=i.createRenderbuffer(),ee(X.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(_t){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),ge(i.TEXTURE_CUBE_MAP,g);for(let at=0;at<6;at++)if(g.mipmaps&&g.mipmaps.length>0)for(let ft=0;ft<g.mipmaps.length;ft++)At(X.__webglFramebuffer[at][ft],A,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+at,ft);else At(X.__webglFramebuffer[at],A,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0);d(g)&&w(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(xt){for(let at=0,ft=rt.length;at<ft;at++){let vt=rt[at],Yt=n.get(vt),wt=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(wt=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(wt,Yt.__webglTexture),ge(wt,vt),At(X.__webglFramebuffer,A,vt,i.COLOR_ATTACHMENT0+at,wt,0),d(vt)&&w(wt)}e.unbindTexture()}else{let at=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(at=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(at,K.__webglTexture),ge(at,g),g.mipmaps&&g.mipmaps.length>0)for(let ft=0;ft<g.mipmaps.length;ft++)At(X.__webglFramebuffer[ft],A,g,i.COLOR_ATTACHMENT0,at,ft);else At(X.__webglFramebuffer,A,g,i.COLOR_ATTACHMENT0,at,0);d(g)&&w(at),e.unbindTexture()}A.depthBuffer&&ce(A)}function he(A){let g=A.textures;for(let X=0,K=g.length;X<K;X++){let rt=g[X];if(d(rt)){let _t=D(A),xt=n.get(rt).__webglTexture;e.bindTexture(_t,xt),w(_t),e.unbindTexture()}}}let ye=[],We=[];function Ke(A){if(A.samples>0){if(Be(A)===!1){let g=A.textures,X=A.width,K=A.height,rt=i.COLOR_BUFFER_BIT,_t=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xt=n.get(A),at=g.length>1;if(at)for(let vt=0;vt<g.length;vt++)e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,xt.__webglMultisampledFramebuffer);let ft=A.texture.mipmaps;ft&&ft.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let vt=0;vt<g.length;vt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(rt|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(rt|=i.STENCIL_BUFFER_BIT)),at){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xt.__webglColorRenderbuffer[vt]);let Yt=n.get(g[vt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Yt,0)}i.blitFramebuffer(0,0,X,K,0,0,X,K,rt,i.NEAREST),l===!0&&(ye.length=0,We.length=0,ye.push(i.COLOR_ATTACHMENT0+vt),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(ye.push(_t),We.push(_t),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,We)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ye))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),at)for(let vt=0;vt<g.length;vt++){e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,xt.__webglColorRenderbuffer[vt]);let Yt=n.get(g[vt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,Yt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){let g=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[g])}}}function Ne(A){return Math.min(s.maxSamples,A.samples)}function Be(A){let g=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function O(A){let g=a.render.frame;u.get(A)!==g&&(u.set(A,g),A.update())}function Wt(A,g){let X=A.colorSpace,K=A.format,rt=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||X!==Er&&X!==Pi&&(_e.getTransfer(X)===Pe?(K!==Xn||rt!==Sn)&&$t("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qt("WebGLTextures: Unsupported texture color space:",X)),g}function Me(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=Y,this.resetTextureUnits=G,this.getTextureUnits=U,this.setTextureUnits=Z,this.setTexture2D=j,this.setTexture2DArray=$,this.setTexture3D=st,this.setTextureCube=W,this.rebindTextures=xe,this.setupRenderTarget=Ae,this.updateRenderTargetMipmap=he,this.updateMultisampleRenderTarget=Ke,this.setupDepthRenderbuffer=ce,this.setupFrameBufferTexture=At,this.useMultisampledRTT=Be,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function w0(i,t){function e(n,s=Pi){let r,a=_e.getTransfer(s);if(n===Sn)return i.UNSIGNED_BYTE;if(n===yo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===vo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===uc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===dc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===cc)return i.BYTE;if(n===hc)return i.SHORT;if(n===ir)return i.UNSIGNED_SHORT;if(n===xo)return i.INT;if(n===ii)return i.UNSIGNED_INT;if(n===Wn)return i.FLOAT;if(n===si)return i.HALF_FLOAT;if(n===fc)return i.ALPHA;if(n===pc)return i.RGB;if(n===Xn)return i.RGBA;if(n===di)return i.DEPTH_COMPONENT;if(n===Ki)return i.DEPTH_STENCIL;if(n===Mo)return i.RED;if(n===So)return i.RED_INTEGER;if(n===$i)return i.RG;if(n===bo)return i.RG_INTEGER;if(n===Eo)return i.RGBA_INTEGER;if(n===Wr||n===Xr||n===qr||n===Yr)if(a===Pe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Wr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Wr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Yr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===To||n===wo||n===Ao||n===Ro)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===To)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===wo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ao)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ro)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Co||n===Po||n===Io||n===Lo||n===Do||n===Zr||n===No)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Co||n===Po)return a===Pe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Io)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Lo)return r.COMPRESSED_R11_EAC;if(n===Do)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Zr)return r.COMPRESSED_RG11_EAC;if(n===No)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Uo||n===Fo||n===Oo||n===Bo||n===zo||n===ko||n===Ho||n===Vo||n===Go||n===Wo||n===Xo||n===qo||n===Yo||n===Zo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Uo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Fo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Oo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Bo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ko)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ho)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Go)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===qo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Yo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Zo)return a===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Jo||n===Ko||n===$o)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Jo)return a===Pe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ko)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===$o)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===jo||n===Qo||n===Jr||n===tl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===jo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Qo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===sr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var A0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,R0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Fc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Ur(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Un({vertexShader:A0,fragmentShader:R0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new de(new hs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Oc=class extends ei{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,h=null,m=null,x=null,S=typeof XRWebGLBinding<"u",p=new Fc,d={},w=e.getContextAttributes(),D=null,M=null,b=[],T=[],P=new Ft,_=null,E=null,L=new fn;L.viewport=new Oe;let z=new fn;z.viewport=new Oe;let H=[L,z],G=new po,U=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ot){let pt=b[ot];return pt===void 0&&(pt=new Gs,b[ot]=pt),pt.getTargetRaySpace()},this.getControllerGrip=function(ot){let pt=b[ot];return pt===void 0&&(pt=new Gs,b[ot]=pt),pt.getGripSpace()},this.getHand=function(ot){let pt=b[ot];return pt===void 0&&(pt=new Gs,b[ot]=pt),pt.getHandSpace()};function Y(ot){let pt=T.indexOf(ot.inputSource);if(pt===-1)return;let Bt=b[pt];Bt!==void 0&&(Bt.update(ot.inputSource,ot.frame,c||a),Bt.dispatchEvent({type:ot.type,data:ot.inputSource}))}function nt(){s.removeEventListener("select",Y),s.removeEventListener("selectstart",Y),s.removeEventListener("selectend",Y),s.removeEventListener("squeeze",Y),s.removeEventListener("squeezestart",Y),s.removeEventListener("squeezeend",Y),s.removeEventListener("end",nt),s.removeEventListener("inputsourceschange",j);for(let ot=0;ot<b.length;ot++){let pt=T[ot];pt!==null&&(T[ot]=null,b[ot].disconnect(pt))}U=null,Z=null,p.reset();for(let ot in d)delete d[ot];if(t.setRenderTarget(D),m=null,h=null,f=null,s=null,M=null,zt.stop(),n.isPresenting=!1,t.setPixelRatio(_),t.setSize(P.width,P.height,!1),E!==null){let ot=E.camera;ot.fov=E.fov,ot.zoom=E.zoom,ot.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ot){r=ot,n.isPresenting===!0&&$t("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ot){o=ot,n.isPresenting===!0&&$t("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ot){c=ot},this.getBaseLayer=function(){return h!==null?h:m},this.getBinding=function(){return f===null&&S&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(ot){if(s=ot,s!==null){if(D=t.getRenderTarget(),s.addEventListener("select",Y),s.addEventListener("selectstart",Y),s.addEventListener("selectend",Y),s.addEventListener("squeeze",Y),s.addEventListener("squeezestart",Y),s.addEventListener("squeezeend",Y),s.addEventListener("end",nt),s.addEventListener("inputsourceschange",j),w.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(P),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let Bt=null,te=null,At=null;w.depth&&(At=w.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Bt=w.stencil?Ki:di,te=w.stencil?sr:ii);let ee={colorFormat:e.RGBA8,depthFormat:At,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(ee),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),M=new vn(h.textureWidth,h.textureHeight,{format:Xn,type:Sn,depthTexture:new ki(h.textureWidth,h.textureHeight,te,void 0,void 0,void 0,void 0,void 0,void 0,Bt),stencilBuffer:w.stencil,colorSpace:t.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Bt={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,Bt),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),M=new vn(m.framebufferWidth,m.framebufferHeight,{format:Xn,type:Sn,colorSpace:t.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),zt.setContext(s),zt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function j(ot){for(let pt=0;pt<ot.removed.length;pt++){let Bt=ot.removed[pt],te=T.indexOf(Bt);te>=0&&(T[te]=null,b[te].disconnect(Bt))}for(let pt=0;pt<ot.added.length;pt++){let Bt=ot.added[pt],te=T.indexOf(Bt);if(te===-1){for(let ee=0;ee<b.length;ee++)if(ee>=T.length){T.push(Bt),te=ee;break}else if(T[ee]===null){T[ee]=Bt,te=ee;break}if(te===-1)break}let At=b[te];At&&At.connect(Bt)}}let $=new I,st=new I;function W(ot,pt,Bt){$.setFromMatrixPosition(pt.matrixWorld),st.setFromMatrixPosition(Bt.matrixWorld);let te=$.distanceTo(st),At=pt.projectionMatrix.elements,ee=Bt.projectionMatrix.elements,Ge=At[14]/(At[10]-1),ce=At[14]/(At[10]+1),xe=(At[9]+1)/At[5],Ae=(At[9]-1)/At[5],he=(At[8]-1)/At[0],ye=(ee[8]+1)/ee[0],We=Ge*he,Ke=Ge*ye,Ne=te/(-he+ye),Be=Ne*-he;if(pt.matrixWorld.decompose(ot.position,ot.quaternion,ot.scale),ot.translateX(Be),ot.translateZ(Ne),ot.matrixWorld.compose(ot.position,ot.quaternion,ot.scale),ot.matrixWorldInverse.copy(ot.matrixWorld).invert(),At[10]===-1)ot.projectionMatrix.copy(pt.projectionMatrix),ot.projectionMatrixInverse.copy(pt.projectionMatrixInverse);else{let O=Ge+Ne,Wt=ce+Ne,Me=We-Be,A=Ke+(te-Be),g=xe*ce/Wt*O,X=Ae*ce/Wt*O;ot.projectionMatrix.makePerspective(Me,A,g,X,O,Wt),ot.projectionMatrixInverse.copy(ot.projectionMatrix).invert()}}function Nt(ot,pt){pt===null?ot.matrixWorld.copy(ot.matrix):ot.matrixWorld.multiplyMatrices(pt.matrixWorld,ot.matrix),ot.matrixWorldInverse.copy(ot.matrixWorld).invert()}this.updateCamera=function(ot){if(s===null)return;let pt=ot.near,Bt=ot.far;p.texture!==null&&(p.depthNear>0&&(pt=p.depthNear),p.depthFar>0&&(Bt=p.depthFar)),G.near=z.near=L.near=pt,G.far=z.far=L.far=Bt,(U!==G.near||Z!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),U=G.near,Z=G.far),G.layers.mask=ot.layers.mask|6,L.layers.mask=G.layers.mask&-5,z.layers.mask=G.layers.mask&-3;let te=ot.parent,At=G.cameras;Nt(G,te);for(let ee=0;ee<At.length;ee++)Nt(At[ee],te);At.length===2?W(G,L,z):G.projectionMatrix.copy(L.projectionMatrix),E===null&&ot.isPerspectiveCamera&&(E={camera:ot,fov:ot.fov,zoom:ot.zoom}),ct(ot,G,te)};function ct(ot,pt,Bt){Bt===null?ot.matrix.copy(pt.matrixWorld):(ot.matrix.copy(Bt.matrixWorld),ot.matrix.invert(),ot.matrix.multiply(pt.matrixWorld)),ot.matrix.decompose(ot.position,ot.quaternion,ot.scale),ot.updateMatrixWorld(!0),ot.projectionMatrix.copy(pt.projectionMatrix),ot.projectionMatrixInverse.copy(pt.projectionMatrixInverse),ot.isPerspectiveCamera&&(ot.fov=ks*2*Math.atan(1/ot.projectionMatrix.elements[5]),ot.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(h===null&&m===null))return l},this.setFoveation=function(ot){l=ot,h!==null&&(h.fixedFoveation=ot),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=ot)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(G)},this.getCameraTexture=function(ot){return d[ot]};let ve=null;function ge(ot,pt){if(u=pt.getViewerPose(c||a),x=pt,u!==null){let Bt=u.views;m!==null&&(t.setRenderTargetFramebuffer(M,m.framebuffer),t.setRenderTarget(M));let te=!1;Bt.length!==G.cameras.length&&(G.cameras.length=0,te=!0);for(let ce=0;ce<Bt.length;ce++){let xe=Bt[ce],Ae=null;if(m!==null)Ae=m.getViewport(xe);else{let ye=f.getViewSubImage(h,xe);Ae=ye.viewport,ce===0&&(t.setRenderTargetTextures(M,ye.colorTexture,ye.depthStencilTexture),t.setRenderTarget(M))}let he=H[ce];he===void 0&&(he=new fn,he.layers.enable(ce),he.viewport=new Oe,H[ce]=he),he.matrix.fromArray(xe.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(xe.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(Ae.x,Ae.y,Ae.width,Ae.height),ce===0&&(G.matrix.copy(he.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),te===!0&&G.cameras.push(he)}let At=s.enabledFeatures;if(At&&At.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&S){f=n.getBinding();let ce=f.getDepthInformation(Bt[0]);ce&&ce.isValid&&ce.texture&&p.init(ce,s.renderState)}if(At&&At.includes("camera-access")&&S){t.state.unbindTexture(),f=n.getBinding();for(let ce=0;ce<Bt.length;ce++){let xe=Bt[ce].camera;if(xe){let Ae=d[xe];Ae||(Ae=new Ur,d[xe]=Ae);let he=f.getCameraImage(xe);Ae.sourceTexture=he}}}}for(let Bt=0;Bt<b.length;Bt++){let te=T[Bt],At=b[Bt];te!==null&&At!==void 0&&At.update(te,pt,c||a)}ve&&ve(ot,pt),pt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pt}),x=null}let zt=new Cu;zt.setAnimationLoop(ge),this.setAnimationLoop=function(ot){ve=ot},this.dispose=function(){}}},C0=new Ee,Uu=new se;Uu.set(-1,0,0,0,1,0,0,0,1);function P0(i,t){function e(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function n(p,d){d.color.getRGB(p.fogColor.value,yc(i)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function s(p,d,w,D,M){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(p,d):d.isMeshLambertMaterial?(r(p,d),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(p,d),f(p,d)):d.isMeshPhongMaterial?(r(p,d),u(p,d),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(p,d),h(p,d),d.isMeshPhysicalMaterial&&m(p,d,M)):d.isMeshMatcapMaterial?(r(p,d),x(p,d)):d.isMeshDepthMaterial?r(p,d):d.isMeshDistanceMaterial?(r(p,d),S(p,d)):d.isMeshNormalMaterial?r(p,d):d.isLineBasicMaterial?(a(p,d),d.isLineDashedMaterial&&o(p,d)):d.isPointsMaterial?l(p,d,w,D):d.isSpriteMaterial?c(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,e(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===an&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,e(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===an&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,e(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,e(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);let w=t.get(d),D=w.envMap,M=w.envMapRotation;D&&(p.envMap.value=D,p.envMapRotation.value.setFromMatrix4(C0.makeRotationFromEuler(M)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Uu),p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,p.aoMapTransform))}function a(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform))}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,w,D){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*w,p.scale.value=D*.5,d.map&&(p.map.value=d.map,e(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function c(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function u(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function f(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function h(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,w){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===an&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.retroreflectivity>0&&(p.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=w.texture,p.transmissionSamplerSize.value.set(w.width,w.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,p.specularIntensityMapTransform))}function x(p,d){d.matcap&&(p.matcap.value=d.matcap)}function S(p,d){let w=t.get(d).light;p.referencePosition.value.setFromMatrixPosition(w.matrixWorld),p.nearDistance.value=w.shadow.camera.near,p.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function I0(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,b){let T=b.program;n.uniformBlockBinding(M,T)}function c(M,b){let T=s[M.id];T===void 0&&(p(M),T=u(M),s[M.id]=T,M.addEventListener("dispose",w));let P=b.program;n.updateUBOMapping(M,P);let _=t.render.frame;r[M.id]!==_&&(h(M),r[M.id]=_)}function u(M){let b=f();M.__bindingPointIndex=b;let T=i.createBuffer(),P=M.__size,_=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,P,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,T),T}function f(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Qt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(M){let b=s[M.id],T=M.uniforms,P=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let _=0,E=T.length;_<E;_++){let L=T[_];if(Array.isArray(L))for(let z=0,H=L.length;z<H;z++)m(L[z],_,z,P);else m(L,_,0,P)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(M,b,T,P){if(S(M,b,T,P)===!0){let _=M.__offset,E=M.value;if(Array.isArray(E)){let L=0;for(let z=0;z<E.length;z++){let H=E[z],G=d(H);x(H,M.__data,L),typeof H!="number"&&typeof H!="boolean"&&!H.isMatrix3&&!ArrayBuffer.isView(H)&&(L+=G.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(E,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,M.__data)}}function x(M,b,T){typeof M=="number"||typeof M=="boolean"?b[0]=M:M.isMatrix3?(b[0]=M.elements[0],b[1]=M.elements[1],b[2]=M.elements[2],b[3]=0,b[4]=M.elements[3],b[5]=M.elements[4],b[6]=M.elements[5],b[7]=0,b[8]=M.elements[6],b[9]=M.elements[7],b[10]=M.elements[8],b[11]=0):ArrayBuffer.isView(M)?b.set(new M.constructor(M.buffer,M.byteOffset,b.length)):M.toArray(b,T)}function S(M,b,T,P){let _=M.value,E=b+"_"+T;if(P[E]===void 0)return typeof _=="number"||typeof _=="boolean"?P[E]=_:ArrayBuffer.isView(_)?P[E]=_.slice():P[E]=_.clone(),!0;{let L=P[E];if(typeof _=="number"||typeof _=="boolean"){if(L!==_)return P[E]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(L.equals(_)===!1)return L.copy(_),!0}}return!1}function p(M){let b=M.uniforms,T=0,P=16;for(let E=0,L=b.length;E<L;E++){let z=Array.isArray(b[E])?b[E]:[b[E]];for(let H=0,G=z.length;H<G;H++){let U=z[H],Z=Array.isArray(U.value)?U.value:[U.value];for(let Y=0,nt=Z.length;Y<nt;Y++){let j=Z[Y],$=d(j),st=T%P,W=st%$.boundary,Nt=st+W;T+=W,Nt!==0&&P-Nt<$.storage&&(T+=P-Nt),U.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=T,T+=$.storage}}}let _=T%P;return _>0&&(T+=P-_),M.__size=T,M.__cache={},this}function d(M){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=48,b.storage=48):M.isMatrix4?(b.boundary=64,b.storage=64):M.isTexture?$t("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):$t("WebGLRenderer: Unsupported uniform value type.",M),b}function w(M){let b=M.target;b.removeEventListener("dispose",w);let T=a.indexOf(b.__bindingPointIndex);a.splice(T,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function D(){for(let M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:D}}var L0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),gi=null;function D0(){return gi===null&&(gi=new Dr(L0,16,16,$i,si),gi.name="DFG_LUT",gi.minFilter=cn,gi.magFilter=cn,gi.wrapS=ui,gi.wrapT=ui,gi.generateMipmaps=!1,gi.needsUpdate=!0),gi}var ll=class{constructor(t={}){let{canvas:e=Qh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:m=Sn}=t;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let S=m,p=new Set([Eo,bo,So]),d=new Set([Sn,ii,ir,sr,yo,vo]),w=new Uint32Array(4),D=new Int32Array(4),M=new I,b=null,T=null,P=[],_=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ni,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let L=this,z=!1,H=null,G=null,U=null,Z=null;this._outputColorSpace=$e;let Y=0,nt=0,j=null,$=-1,st=null,W=new Oe,Nt=new Oe,ct=null,ve=new Ot(0),ge=0,zt=e.width,ot=e.height,pt=1,Bt=null,te=null,At=new Oe(0,0,zt,ot),ee=new Oe(0,0,zt,ot),Ge=!1,ce=new Zs,xe=!1,Ae=!1,he=new Ee,ye=new I,We=new Oe,Ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Be(){return j===null?pt:1}let O=n;function Wt(v,F){return e.getContext(v,F)}let Me,A,g,X,K,rt,_t,xt,at,ft,vt,Yt,wt,Mt,Zt,Kt,re,B,bt,dt,Et,Rt,mt;try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Re,!1),e.addEventListener("webglcontextrestored",Se,!1),e.addEventListener("webglcontextcreationerror",En,!1),O===null){let F="webgl2";if(O=Wt(F,v),O===null)throw Wt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Jt()}catch(v){throw e.removeEventListener("webglcontextlost",Re,!1),e.removeEventListener("webglcontextrestored",Se,!1),e.removeEventListener("webglcontextcreationerror",En,!1),Qt("WebGLRenderer: "+v.message),v}function Jt(){Me=new km(O),Me.init(),Et=new w0(O,Me),A=new Pm(O,Me,t,Et),g=new E0(O,Me),A.reversedDepthBuffer&&h&&g.buffers.depth.setReversed(!0),G=O.createFramebuffer(),U=O.createFramebuffer(),Z=O.createFramebuffer(),X=new Gm(O),K=new h0,rt=new T0(O,Me,g,K,A,Et,X),_t=new zm(L),xt=new Wd(O),Rt=new Rm(O,xt),at=new Hm(O,xt,X,Rt),ft=new Xm(O,at,xt,Rt,X),B=new Wm(O,A,rt),Zt=new Im(K),vt=new c0(L,_t,Me,A,Rt,Zt),Yt=new P0(L,K),wt=new d0,Mt=new x0(Me),re=new Am(L,_t,g,ft,x,l),Kt=new b0(L,ft,A),mt=new I0(O,X,A,g),bt=new Cm(O,Me,X),dt=new Vm(O,Me,X),X.programs=vt.programs,L.capabilities=A,L.extensions=Me,L.properties=K,L.renderLists=wt,L.shadowMap=Kt,L.state=g,L.info=X}S!==Sn&&(E=new Ym(S,e.width,e.height,o,s,r));let Ht=new Oc(L,O);this.xr=Ht,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let v=Me.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Me.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return pt},this.setPixelRatio=function(v){v!==void 0&&(pt=v,this.setSize(zt,ot,!1))},this.getSize=function(v){return v.set(zt,ot)},this.setSize=function(v,F,Q=!0){if(Ht.isPresenting){$t("WebGLRenderer: Can't change size while VR device is presenting.");return}zt=v,ot=F,e.width=Math.floor(v*pt),e.height=Math.floor(F*pt),Q===!0&&(e.style.width=v+"px",e.style.height=F+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,v,F)},this.getDrawingBufferSize=function(v){return v.set(zt*pt,ot*pt).floor()},this.setDrawingBufferSize=function(v,F,Q){zt=v,ot=F,pt=Q,e.width=Math.floor(v*Q),e.height=Math.floor(F*Q),this.setViewport(0,0,v,F)},this.setEffects=function(v){if(S===Sn){Qt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let F=0;F<v.length;F++)if(v[F].isOutputPass===!0){$t("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(W)},this.getViewport=function(v){return v.copy(At)},this.setViewport=function(v,F,Q,q){v.isVector4?At.set(v.x,v.y,v.z,v.w):At.set(v,F,Q,q),g.viewport(W.copy(At).multiplyScalar(pt).round())},this.getScissor=function(v){return v.copy(ee)},this.setScissor=function(v,F,Q,q){v.isVector4?ee.set(v.x,v.y,v.z,v.w):ee.set(v,F,Q,q),g.scissor(Nt.copy(ee).multiplyScalar(pt).round())},this.getScissorTest=function(){return Ge},this.setScissorTest=function(v){g.setScissorTest(Ge=v)},this.setOpaqueSort=function(v){Bt=v},this.setTransparentSort=function(v){te=v},this.getClearColor=function(v){return v.copy(re.getClearColor())},this.setClearColor=function(){re.setClearColor(...arguments)},this.getClearAlpha=function(){return re.getClearAlpha()},this.setClearAlpha=function(){re.setClearAlpha(...arguments)},this.clear=function(v=!0,F=!0,Q=!0){let q=0;if(v){let J=!1;if(j!==null){let Ct=j.texture.format;J=p.has(Ct)}if(J){let Ct=j.texture.type,Dt=d.has(Ct),Pt=re.getClearColor(),Vt=re.getClearAlpha(),Xt=Pt.r,oe=Pt.g,ue=Pt.b;Dt?(w[0]=Xt,w[1]=oe,w[2]=ue,w[3]=Vt,O.clearBufferuiv(O.COLOR,0,w)):(D[0]=Xt,D[1]=oe,D[2]=ue,D[3]=Vt,O.clearBufferiv(O.COLOR,0,D))}else q|=O.COLOR_BUFFER_BIT}F&&(q|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Q&&(q|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q!==0&&O.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),H=v},this.dispose=function(){e.removeEventListener("webglcontextlost",Re,!1),e.removeEventListener("webglcontextrestored",Se,!1),e.removeEventListener("webglcontextcreationerror",En,!1),re.dispose(),wt.dispose(),Mt.dispose(),K.dispose(),_t.dispose(),ft.dispose(),Rt.dispose(),mt.dispose(),vt.dispose(),Ht.dispose(),Ht.removeEventListener("sessionstart",He),Ht.removeEventListener("sessionend",on),yn.stop()};function Re(v){v.preventDefault(),Ar("WebGLRenderer: Context Lost."),z=!0}function Se(){Ar("WebGLRenderer: Context Restored."),z=!1;let v=X.autoReset,F=Kt.enabled,Q=Kt.autoUpdate,q=Kt.needsUpdate,J=Kt.type;Jt(),X.autoReset=v,Kt.enabled=F,Kt.autoUpdate=Q,Kt.needsUpdate=q,Kt.type=J}function En(v){Qt("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Tn(v){let F=v.target;F.removeEventListener("dispose",Tn),wn(F)}function wn(v){On(v),K.remove(v)}function On(v){let F=K.get(v).programs;F!==void 0&&(F.forEach(function(Q){vt.releaseProgram(Q)}),v.isShaderMaterial&&vt.releaseShaderCache(v))}this.renderBufferDirect=function(v,F,Q,q,J,Ct){F===null&&(F=Ke);let Dt=J.isMesh&&J.matrixWorld.determinantAffine()<0,Pt=hr(v,F,Q,q,J);g.setMaterial(q,Dt);let Vt=Q.index,Xt=1;if(q.wireframe===!0){if(Vt=at.getWireframeAttribute(Q),Vt===void 0)return;Xt=2}let oe=Q.drawRange,ue=Q.attributes.position,kt=oe.start*Xt,y=(oe.start+oe.count)*Xt;Ct!==null&&(kt=Math.max(kt,Ct.start*Xt),y=Math.min(y,(Ct.start+Ct.count)*Xt)),Vt!==null?(kt=Math.max(kt,0),y=Math.min(y,Vt.count)):ue!=null&&(kt=Math.max(kt,0),y=Math.min(y,ue.count));let R=y-kt;if(R<0||R===1/0)return;Rt.setup(J,q,Pt,Q,Vt);let C,k=bt;if(Vt!==null&&(C=xt.get(Vt),k=dt,k.setIndex(C)),J.isMesh)q.wireframe===!0?(g.setLineWidth(q.wireframeLinewidth*Be()),k.setMode(O.LINES)):k.setMode(O.TRIANGLES);else if(J.isLine){let lt=q.linewidth;lt===void 0&&(lt=1),g.setLineWidth(lt*Be()),J.isLineSegments?k.setMode(O.LINES):J.isLineLoop?k.setMode(O.LINE_LOOP):k.setMode(O.LINE_STRIP)}else J.isPoints?k.setMode(O.POINTS):J.isSprite&&k.setMode(O.TRIANGLES);if(J.isBatchedMesh)if(Me.get("WEBGL_multi_draw"))k.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let lt=J._multiDrawStarts,N=J._multiDrawCounts,tt=J._multiDrawCount,it=Vt?xt.get(Vt).bytesPerElement:1,It=K.get(q).currentProgram.getUniforms();for(let ht=0;ht<tt;ht++)It.setValue(O,"_gl_DrawID",ht),k.render(lt[ht]/it,N[ht])}else if(J.isInstancedMesh)k.renderInstances(kt,R,J.count);else if(Q.isInstancedBufferGeometry){let lt=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,N=Math.min(Q.instanceCount,lt);k.renderInstances(kt,R,N)}else k.render(kt,R)};function Qr(v,F,Q,q){H!==null&&v.isNodeMaterial&&H.setObject(q,v),xe===!0&&Zt.setState(v,Q,!1),v.transparent===!0&&v.side===Ye&&v.forceSinglePass===!1?(v.side=an,v.needsUpdate=!0,Zn(v,F,q),v.side=pi,v.needsUpdate=!0,Zn(v,F,q),v.side=Ye):Zn(v,F,q)}this.compile=function(v,F,Q=null){Q===null&&(Q=v),H!==null&&H.renderStart(v,F,Q),T=Mt.get(Q),T.init(F),_.push(T),Q.traverseVisible(function(J){J.isLight&&J.layers.test(F.layers)&&(T.pushLight(J),J.castShadow&&T.pushShadow(J))}),v!==Q&&v.traverseVisible(function(J){J.isLight&&J.layers.test(F.layers)&&(T.pushLight(J),J.castShadow&&T.pushShadow(J))}),T.setupLights(),H!==null&&H.updateLights(T.state.lightsArray),Ae=this.localClippingEnabled,xe=Zt.init(this.clippingPlanes,Ae),xe===!0&&Zt.setGlobalState(this.clippingPlanes,F),H!==null&&Kt.render(T.state.shadowsArray,Q,F);let q=new Set;return v.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let Ct=J.material;if(Ct)if(Array.isArray(Ct))for(let Dt=0;Dt<Ct.length;Dt++){let Pt=Ct[Dt];Qr(Pt,Q,F,J),q.add(Pt)}else Qr(Ct,Q,F,J),q.add(Ct)}),T=_.pop(),H!==null&&H.renderEnd(),q},this.compileAsync=function(v,F,Q=null){let q=this.compile(v,F,Q);return new Promise(J=>{function Ct(){if(q.forEach(function(Dt){let Vt=K.get(Dt).currentProgram;(Vt===void 0||Vt.isReady())&&q.delete(Dt)}),q.size===0){J(v);return}setTimeout(Ct,10)}Me.get("KHR_parallel_shader_compile")!==null?Ct():setTimeout(Ct,10)})};let Ce=null;function Yn(v){Ce&&Ce(v)}function He(){yn.stop()}function on(){yn.start()}let yn=new Cu;yn.setAnimationLoop(Yn),typeof self<"u"&&yn.setContext(self),this.setAnimationLoop=function(v){Ce=v,Ht.setAnimationLoop(v),v===null?yn.stop():yn.start()},Ht.addEventListener("sessionstart",He),Ht.addEventListener("sessionend",on),this.render=function(v,F){if(F!==void 0&&F.isCamera!==!0){Qt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(z===!0)return;H!==null&&H.renderStart(v,F);let Q=Ht.enabled===!0&&Ht.isPresenting===!0,q=E!==null&&(j===null||Q)&&E.begin(L,j);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Ht.enabled===!0&&Ht.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Ht.cameraAutoUpdate===!0&&Ht.updateCamera(F),F=Ht.getCamera()),v.isScene===!0&&v.onBeforeRender(L,v,F,j),T=Mt.get(v,_.length),T.init(F),T.state.textureUnits=rt.getTextureUnits(),_.push(T),he.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),ce.setFromProjectionMatrix(he,ti,F.reversedDepth),Ae=this.localClippingEnabled,xe=Zt.init(this.clippingPlanes,Ae),b=wt.get(v,P.length),b.init(),P.push(b),Ht.enabled===!0&&Ht.isPresenting===!0){let Dt=L.xr.getDepthSensingMesh();Dt!==null&&ai(Dt,F,-1/0,L.sortObjects)}ai(v,F,0,L.sortObjects),b.finish(),H!==null&&H.updateLights(T.state.lightsArray),L.sortObjects===!0&&b.sort(Bt,te),Ne=Ht.enabled===!1||Ht.isPresenting===!1||Ht.hasDepthSensing()===!1,Ne&&re.addToRenderList(b,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),xe===!0&&Zt.beginShadows();let J=T.state.shadowsArray;if(Kt.render(J,v,F),xe===!0&&Zt.endShadows(),(q&&E.hasRenderPass())===!1){let Dt=b.opaque,Pt=b.transmissive;if(T.setupLights(),F.isArrayCamera){let Vt=F.cameras;if(Pt.length>0)for(let Xt=0,oe=Vt.length;Xt<oe;Xt++){let ue=Vt[Xt];cr(Dt,Pt,v,ue)}Ne&&re.render(v);for(let Xt=0,oe=Vt.length;Xt<oe;Xt++){let ue=Vt[Xt];Qi(b,v,ue,ue.viewport)}}else Pt.length>0&&cr(Dt,Pt,v,F),Ne&&re.render(v),Qi(b,v,F)}j!==null&&nt===0&&(rt.updateMultisampleRenderTarget(j),rt.updateRenderTargetMipmap(j)),q&&E.end(L),v.isScene===!0&&v.onAfterRender(L,v,F),Rt.resetDefaultState(),$=-1,st=null,_.pop(),_.length>0?(T=_[_.length-1],rt.setTextureUnits(T.state.textureUnits),xe===!0&&Zt.setGlobalState(L.clippingPlanes,T.state.camera)):T=null,P.pop(),P.length>0?b=P[P.length-1]:b=null,H!==null&&H.renderEnd()};function ai(v,F,Q,q){if(v.visible===!1)return;if(v.layers.test(F.layers)){if(v.isGroup)Q=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(F);else if(v.isLightProbeGrid)T.pushLightProbeGrid(v);else if(v.isLight)T.pushLight(v),v.castShadow&&T.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(ce)){q&&We.setFromMatrixPosition(v.matrixWorld).applyMatrix4(he);let Dt=ft.update(v),Pt=v.material;Pt.visible&&b.push(v,Dt,Pt,Q,We.z,null,F)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(ce))){let Dt=ft.update(v),Pt=v.material;if(q&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),We.copy(v.boundingSphere.center)):(Dt.boundingSphere===null&&Dt.computeBoundingSphere(),We.copy(Dt.boundingSphere.center)),We.applyMatrix4(v.matrixWorld).applyMatrix4(he)),Array.isArray(Pt)){let Vt=Dt.groups;for(let Xt=0,oe=Vt.length;Xt<oe;Xt++){let ue=Vt[Xt],kt=Pt[ue.materialIndex];kt&&kt.visible&&b.push(v,Dt,kt,Q,We.z,ue,F)}}else Pt.visible&&b.push(v,Dt,Pt,Q,We.z,null,F)}}let Ct=v.children;for(let Dt=0,Pt=Ct.length;Dt<Pt;Dt++)ai(Ct[Dt],F,Q,q)}function Qi(v,F,Q,q){let{opaque:J,transmissive:Ct,transparent:Dt}=v;T.setupLightsView(Q),xe===!0&&Zt.setGlobalState(L.clippingPlanes,Q),q&&g.viewport(W.copy(q)),J.length>0&&oi(J,F,Q),Ct.length>0&&oi(Ct,F,Q),Dt.length>0&&oi(Dt,F,Q),g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),g.setPolygonOffset(!1)}function cr(v,F,Q,q){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[q.id]===void 0){let kt=Me.has("EXT_color_buffer_half_float")||Me.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[q.id]=new vn(1,1,{generateMipmaps:!0,type:kt?si:Sn,minFilter:Ji,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:_e.workingColorSpace})}let Ct=T.state.transmissionRenderTarget[q.id],Dt=q.viewport||W;Ct.setSize(Dt.z*L.transmissionResolutionScale,Dt.w*L.transmissionResolutionScale);let Pt=L.getRenderTarget(),Vt=L.getActiveCubeFace(),Xt=L.getActiveMipmapLevel();L.setRenderTarget(Ct),L.getClearColor(ve),ge=L.getClearAlpha(),ge<1&&L.setClearColor(16777215,.5),L.clear(),Ne&&re.render(Q);let oe=L.toneMapping;L.toneMapping=ni;let ue=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),T.setupLightsView(q),xe===!0&&Zt.setGlobalState(L.clippingPlanes,q),oi(v,Q,q),rt.updateMultisampleRenderTarget(Ct),rt.updateRenderTargetMipmap(Ct),Me.has("WEBGL_multisampled_render_to_texture")===!1){let kt=!1;for(let y=0,R=F.length;y<R;y++){let C=F[y],{object:k,geometry:lt,material:N,group:tt}=C;if(N.side===Ye&&k.layers.test(q.layers)){let it=N.side;N.side=an,N.needsUpdate=!0,ta(k,Q,q,lt,N,tt),N.side=it,N.needsUpdate=!0,kt=!0}}kt===!0&&(rt.updateMultisampleRenderTarget(Ct),rt.updateRenderTargetMipmap(Ct))}L.setRenderTarget(Pt,Vt,Xt),L.setClearColor(ve,ge),ue!==void 0&&(q.viewport=ue),L.toneMapping=oe}function oi(v,F,Q){let q=F.isScene===!0?F.overrideMaterial:null;for(let J=0,Ct=v.length;J<Ct;J++){let Dt=v[J],{object:Pt,geometry:Vt,group:Xt}=Dt,oe=Dt.material;oe.allowOverride===!0&&q!==null&&(oe=q),Pt.layers.test(Q.layers)&&ta(Pt,F,Q,Vt,oe,Xt)}}function ta(v,F,Q,q,J,Ct){H!==null&&J.isNodeMaterial&&H.setObject(v,J),v.onBeforeRender(L,F,Q,q,J,Ct),v.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),J.onBeforeRender(L,F,Q,q,v,Ct),J.transparent===!0&&J.side===Ye&&J.forceSinglePass===!1?(J.side=an,J.needsUpdate=!0,L.renderBufferDirect(Q,F,q,J,v,Ct),J.side=pi,J.needsUpdate=!0,L.renderBufferDirect(Q,F,q,J,v,Ct),J.side=Ye):L.renderBufferDirect(Q,F,q,J,v,Ct),v.onAfterRender(L,F,Q,q,J,Ct)}function Zn(v,F,Q){F.isScene!==!0&&(F=Ke);let q=K.get(v),J=T.state.lights,Ct=T.state.shadowsArray,Dt=J.state.version,Pt=vt.getParameters(v,J.state,Ct,F,Q,T.state.lightProbeGridArray),Vt=vt.getProgramCacheKey(Pt),Xt=q.programs;q.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?F.environment:null,q.fog=F.fog;let oe=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;q.envMap=_t.get(v.envMap||q.environment,oe),q.envMapRotation=q.environment!==null&&v.envMap===null?F.environmentRotation:v.envMapRotation,Xt===void 0&&(v.addEventListener("dispose",Tn),Xt=new Map,q.programs=Xt);let ue=Xt.get(Vt);if(ue!==void 0){if(q.currentProgram===ue&&q.lightsStateVersion===Dt)return na(v,Pt),ue}else Pt.uniforms=vt.getUniforms(v),H!==null&&v.isNodeMaterial&&H.build(v,Q,Pt),v.onBeforeCompile(Pt,L),ue=vt.acquireProgram(Pt,Vt),Xt.set(Vt,ue),q.uniforms=Pt.uniforms;let kt=q.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(kt.clippingPlanes=Zt.uniform),na(v,Pt),q.needsLights=pl(v),q.lightsStateVersion=Dt,q.needsLights&&(kt.ambientLightColor.value=J.state.ambient,kt.lightProbe.value=J.state.probe,kt.sunLights.value=J.state.sun,kt.sunLightShadows.value=J.state.sunShadow,kt.directionalLights.value=J.state.directional,kt.directionalLightShadows.value=J.state.directionalShadow,kt.spotLights.value=J.state.spot,kt.spotLightShadows.value=J.state.spotShadow,kt.rectAreaLights.value=J.state.rectArea,kt.ltc_1.value=J.state.rectAreaLTC1,kt.ltc_2.value=J.state.rectAreaLTC2,kt.pointLights.value=J.state.point,kt.pointLightShadows.value=J.state.pointShadow,kt.hemisphereLights.value=J.state.hemi,kt.sunShadowMatrix.value=J.state.sunShadowMatrix,kt.sunShadowCascade.value=J.state.sunShadowCascade,kt.directionalShadowMatrix.value=J.state.directionalShadowMatrix,kt.spotLightMatrix.value=J.state.spotLightMatrix,kt.spotLightMap.value=J.state.spotLightMap,kt.pointShadowMatrix.value=J.state.pointShadowMatrix),q.lightProbeGrid=T.state.lightProbeGridArray.length>0,q.currentProgram=ue,q.uniformsList=null,ue}function ea(v){if(v.uniformsList===null){let F=v.currentProgram.getUniforms();v.uniformsList=or.seqWithValue(F.seq,v.uniforms)}return v.uniformsList}function na(v,F){let Q=K.get(v);Q.outputColorSpace=F.outputColorSpace,Q.batching=F.batching,Q.batchingColor=F.batchingColor,Q.instancing=F.instancing,Q.instancingColor=F.instancingColor,Q.instancingMorph=F.instancingMorph,Q.skinning=F.skinning,Q.morphTargets=F.morphTargets,Q.morphNormals=F.morphNormals,Q.morphColors=F.morphColors,Q.morphTargetsCount=F.morphTargetsCount,Q.numClippingPlanes=F.numClippingPlanes,Q.numIntersection=F.numClipIntersection,Q.vertexAlphas=F.vertexAlphas,Q.vertexTangents=F.vertexTangents,Q.toneMapping=F.toneMapping}function ts(v,F){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;M.setFromMatrixPosition(F.matrixWorld);for(let Q=0,q=v.length;Q<q;Q++){let J=v[Q];if(J.texture!==null&&J.boundingBox.containsPoint(M))return J}return null}function hr(v,F,Q,q,J){F.isScene!==!0&&(F=Ke),rt.resetTextureUnits();let Ct=F.fog,Dt=q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial?F.environment:null,Pt=j===null?L.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:_e.workingColorSpace,Vt=q.isMeshStandardMaterial||q.isMeshLambertMaterial&&!q.envMap||q.isMeshPhongMaterial&&!q.envMap,Xt=_t.get(q.envMap||Dt,Vt),oe=q.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,ue=!!Q.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),kt=!!Q.morphAttributes.position,y=!!Q.morphAttributes.normal,R=!!Q.morphAttributes.color,C=ni;q.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(C=L.toneMapping);let k=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,lt=k!==void 0?k.length:0,N=K.get(q),tt=T.state.lights;if(xe===!0&&(Ae===!0||v!==st)){let ne=v===st&&q.id===$;Zt.setState(q,v,ne)}let it=!1;q.version===N.__version?(N.needsLights&&N.lightsStateVersion!==tt.state.version||N.outputColorSpace!==Pt||J.isBatchedMesh&&N.batching===!1||!J.isBatchedMesh&&N.batching===!0||J.isBatchedMesh&&N.batchingColor===!0&&J._colorsTexture===null||J.isBatchedMesh&&N.batchingColor===!1&&J._colorsTexture!==null||J.isInstancedMesh&&N.instancing===!1||!J.isInstancedMesh&&N.instancing===!0||J.isSkinnedMesh&&N.skinning===!1||!J.isSkinnedMesh&&N.skinning===!0||J.isInstancedMesh&&N.instancingColor===!0&&J.instanceColor===null||J.isInstancedMesh&&N.instancingColor===!1&&J.instanceColor!==null||J.isInstancedMesh&&N.instancingMorph===!0&&J.morphTexture===null||J.isInstancedMesh&&N.instancingMorph===!1&&J.morphTexture!==null||N.envMap!==Xt||q.fog===!0&&N.fog!==Ct||N.numClippingPlanes!==void 0&&(N.numClippingPlanes!==Zt.numPlanes||N.numIntersection!==Zt.numIntersection)||N.vertexAlphas!==oe||N.vertexTangents!==ue||N.morphTargets!==kt||N.morphNormals!==y||N.morphColors!==R||N.toneMapping!==C||N.morphTargetsCount!==lt||!!N.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(it=!0):(it=!0,N.__version=q.version);let It=N.currentProgram;it===!0&&(It=Zn(q,F,J),H&&q.isNodeMaterial&&H.onUpdateProgram(q,It,N));let ht=!1,yt=!1,Gt=!1,gt=It.getUniforms(),qt=N.uniforms;if(g.useProgram(It.program)&&(ht=!0,yt=!0,Gt=!0),q.id!==$&&($=q.id,yt=!0),N.needsLights){let ne=ts(T.state.lightProbeGridArray,J);N.lightProbeGrid!==ne&&(N.lightProbeGrid=ne,yt=!0)}if(ht||st!==v){g.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),gt.setValue(O,"projectionMatrix",v.projectionMatrix),gt.setValue(O,"viewMatrix",v.matrixWorldInverse);let St=gt.map.cameraPosition;St!==void 0&&St.setValue(O,ye.setFromMatrixPosition(v.matrixWorld)),A.logarithmicDepthBuffer&&gt.setValue(O,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&gt.setValue(O,"isOrthographic",v.isOrthographicCamera===!0),st!==v&&(st=v,yt=!0,Gt=!0)}if(N.needsLights&&(tt.state.sunShadowMap.length>0&&gt.setValue(O,"sunShadowMap",tt.state.sunShadowMap,rt),tt.state.directionalShadowMap.length>0&&gt.setValue(O,"directionalShadowMap",tt.state.directionalShadowMap,rt),tt.state.spotShadowMap.length>0&&gt.setValue(O,"spotShadowMap",tt.state.spotShadowMap,rt),tt.state.pointShadowMap.length>0&&gt.setValue(O,"pointShadowMap",tt.state.pointShadowMap,rt)),J.isSkinnedMesh){gt.setOptional(O,J,"bindMatrix"),gt.setOptional(O,J,"bindMatrixInverse");let ne=J.skeleton;ne&&(ne.boneTexture===null&&ne.computeBoneTexture(),gt.setValue(O,"boneTexture",ne.boneTexture,rt))}J.isBatchedMesh&&(gt.setOptional(O,J,"batchingTexture"),gt.setValue(O,"batchingTexture",J._matricesTexture,rt),gt.setOptional(O,J,"batchingIdTexture"),gt.setValue(O,"batchingIdTexture",J._indirectTexture,rt),gt.setOptional(O,J,"batchingColorTexture"),J._colorsTexture!==null&&gt.setValue(O,"batchingColorTexture",J._colorsTexture,rt));let Ut=Q.morphAttributes;if((Ut.position!==void 0||Ut.normal!==void 0||Ut.color!==void 0)&&B.update(J,Q,It),(yt||N.receiveShadow!==J.receiveShadow)&&(N.receiveShadow=J.receiveShadow,gt.setValue(O,"receiveShadow",J.receiveShadow)),(q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial)&&q.envMap===null&&F.environment!==null&&(qt.envMapIntensity.value=F.environmentIntensity),qt.dfgLUT!==void 0&&(qt.dfgLUT.value=D0()),yt){if(gt.setValue(O,"toneMappingExposure",L.toneMappingExposure),N.needsLights&&fl(qt,Gt),Ct&&q.fog===!0&&Yt.refreshFogUniforms(qt,Ct),Yt.refreshMaterialUniforms(qt,q,pt,ot,T.state.transmissionRenderTarget[v.id]),N.needsLights&&N.lightProbeGrid){let ne=N.lightProbeGrid;qt.probesSH.value=ne.texture,qt.probesMin.value.copy(ne.boundingBox.min),qt.probesMax.value.copy(ne.boundingBox.max),qt.probesResolution.value.copy(ne.resolution)}or.upload(O,ea(N),qt,rt)}if(q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(or.upload(O,ea(N),qt,rt),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&gt.setValue(O,"center",J.center),gt.setValue(O,"modelViewMatrix",J.modelViewMatrix),gt.setValue(O,"normalMatrix",J.normalMatrix),gt.setValue(O,"modelMatrix",J.matrixWorld),q.uniformsGroups!==void 0){let ne=q.uniformsGroups;for(let St=0,et=ne.length;St<et;St++){let be=ne[St];mt.update(be,It),mt.bind(be,It)}}return It}function fl(v,F){v.ambientLightColor.needsUpdate=F,v.lightProbe.needsUpdate=F,v.sunLights.needsUpdate=F,v.sunLightShadows.needsUpdate=F,v.directionalLights.needsUpdate=F,v.directionalLightShadows.needsUpdate=F,v.pointLights.needsUpdate=F,v.pointLightShadows.needsUpdate=F,v.spotLights.needsUpdate=F,v.spotLightShadows.needsUpdate=F,v.rectAreaLights.needsUpdate=F,v.hemisphereLights.needsUpdate=F}function pl(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return nt},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(v,F,Q){let q=K.get(v);q.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),K.get(v.texture).__webglTexture=F,K.get(v.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:Q,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,F){let Q=K.get(v);Q.__webglFramebuffer=F,Q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(v,F=0,Q=0){j=v,Y=F,nt=Q;let q=null,J=!1,Ct=!1;if(v){let Pt=K.get(v);if(Pt.__useDefaultFramebuffer!==void 0){g.bindFramebuffer(O.FRAMEBUFFER,Pt.__webglFramebuffer),W.copy(v.viewport),Nt.copy(v.scissor),ct=v.scissorTest,g.viewport(W),g.scissor(Nt),g.setScissorTest(ct),$=-1;return}else if(Pt.__webglFramebuffer===void 0)rt.setupRenderTarget(v);else if(Pt.__hasExternalTextures)rt.rebindTextures(v,K.get(v.texture).__webglTexture,K.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let oe=v.depthTexture;if(Pt.__boundDepthTexture!==oe){if(oe!==null&&K.has(oe)&&(v.width!==oe.image.width||v.height!==oe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");rt.setupDepthRenderbuffer(v)}}let Vt=v.texture;(Vt.isData3DTexture||Vt.isDataArrayTexture||Vt.isCompressedArrayTexture)&&(Ct=!0);let Xt=K.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Xt[F])?q=Xt[F][Q]:q=Xt[F],J=!0):v.samples>0&&rt.useMultisampledRTT(v)===!1?q=K.get(v).__webglMultisampledFramebuffer:Array.isArray(Xt)?q=Xt[Q]:q=Xt,W.copy(v.viewport),Nt.copy(v.scissor),ct=v.scissorTest}else W.copy(At).multiplyScalar(pt).floor(),Nt.copy(ee).multiplyScalar(pt).floor(),ct=Ge;if(Q!==0&&(q=G),g.bindFramebuffer(O.FRAMEBUFFER,q)&&g.drawBuffers(v,q),g.viewport(W),g.scissor(Nt),g.setScissorTest(ct),J){let Pt=K.get(v.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+F,Pt.__webglTexture,Q)}else if(Ct){let Pt=F;for(let Vt=0;Vt<v.textures.length;Vt++){let Xt=K.get(v.textures[Vt]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Vt,Xt.__webglTexture,Q,Pt)}}else if(v!==null&&Q!==0){let Pt=K.get(v.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Pt.__webglTexture,Q)}$=-1};function Ii(v){let F=K.get(v);return(F.__readFormat!==v.format||F.__readType!==v.type)&&(F.__readFormat=v.format,F.__readType=v.type,F.__formatReadable=A.textureFormatReadable(v.format),F.__typeReadable=A.textureTypeReadable(v.type)),F}this.readRenderTargetPixels=function(v,F,Q,q,J,Ct,Dt,Pt=0){if(!(v&&v.isWebGLRenderTarget)){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Vt=K.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&Dt!==void 0&&(Vt=Vt[Dt]),Vt){g.bindFramebuffer(O.FRAMEBUFFER,Vt);try{let Xt=v.textures[Pt],oe=Xt.format,ue=Xt.type;v.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Pt);let kt=Ii(Xt);if(kt.__formatReadable===!1){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(kt.__typeReadable===!1){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=v.width-q&&Q>=0&&Q<=v.height-J&&O.readPixels(F,Q,q,J,Et.convert(oe),Et.convert(ue),Ct)}finally{let Xt=j!==null?K.get(j).__webglFramebuffer:null;g.bindFramebuffer(O.FRAMEBUFFER,Xt)}}},this.readRenderTargetPixelsAsync=async function(v,F,Q,q,J,Ct,Dt,Pt=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Vt=K.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&Dt!==void 0&&(Vt=Vt[Dt]),Vt)if(F>=0&&F<=v.width-q&&Q>=0&&Q<=v.height-J){g.bindFramebuffer(O.FRAMEBUFFER,Vt);let Xt=v.textures[Pt],oe=Xt.format,ue=Xt.type;v.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Pt);let kt=Ii(Xt);if(kt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(kt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let y=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,y),O.bufferData(O.PIXEL_PACK_BUFFER,Ct.byteLength,O.STREAM_READ),O.readPixels(F,Q,q,J,Et.convert(oe),Et.convert(ue),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let R=j!==null?K.get(j).__webglFramebuffer:null;g.bindFramebuffer(O.FRAMEBUFFER,R);let C=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await eu(O,C,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,y),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,Ct),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(y),O.deleteSync(C),Ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,F=null,Q=0){let q=Math.pow(2,-Q),J=Math.floor(v.image.width*q),Ct=Math.floor(v.image.height*q),Dt=F!==null?F.x:0,Pt=F!==null?F.y:0;rt.setTexture2D(v,0),O.copyTexSubImage2D(O.TEXTURE_2D,Q,0,0,Dt,Pt,J,Ct),g.unbindTexture()},this.copyTextureToTexture=function(v,F,Q=null,q=null,J=0,Ct=0){let Dt,Pt,Vt,Xt,oe,ue,kt,y,R,C=v.isCompressedTexture?v.mipmaps[Ct]:v.image;if(Q!==null)Dt=Q.max.x-Q.min.x,Pt=Q.max.y-Q.min.y,Vt=Q.isBox3?Q.max.z-Q.min.z:1,Xt=Q.min.x,oe=Q.min.y,ue=Q.isBox3?Q.min.z:0;else{let qt=Math.pow(2,-J);Dt=Math.floor(C.width*qt),Pt=Math.floor(C.height*qt),v.isDataArrayTexture?Vt=C.depth:v.isData3DTexture?Vt=Math.floor(C.depth*qt):Vt=1,Xt=0,oe=0,ue=0}q!==null?(kt=q.x,y=q.y,R=q.z):(kt=0,y=0,R=0);let k=Et.convert(F.format),lt=Et.convert(F.type),N;F.isData3DTexture?(rt.setTexture3D(F,0),N=O.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(rt.setTexture2DArray(F,0),N=O.TEXTURE_2D_ARRAY):(rt.setTexture2D(F,0),N=O.TEXTURE_2D),g.activeTexture(O.TEXTURE0),g.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,F.flipY),g.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),g.pixelStorei(O.UNPACK_ALIGNMENT,F.unpackAlignment);let tt=g.getParameter(O.UNPACK_ROW_LENGTH),it=g.getParameter(O.UNPACK_IMAGE_HEIGHT),It=g.getParameter(O.UNPACK_SKIP_PIXELS),ht=g.getParameter(O.UNPACK_SKIP_ROWS),yt=g.getParameter(O.UNPACK_SKIP_IMAGES);g.pixelStorei(O.UNPACK_ROW_LENGTH,C.width),g.pixelStorei(O.UNPACK_IMAGE_HEIGHT,C.height),g.pixelStorei(O.UNPACK_SKIP_PIXELS,Xt),g.pixelStorei(O.UNPACK_SKIP_ROWS,oe),g.pixelStorei(O.UNPACK_SKIP_IMAGES,ue);let Gt=v.isDataArrayTexture||v.isData3DTexture,gt=F.isDataArrayTexture||F.isData3DTexture;if(v.isDepthTexture){let qt=K.get(v),Ut=K.get(F),ne=K.get(qt.__renderTarget),St=K.get(Ut.__renderTarget);g.bindFramebuffer(O.READ_FRAMEBUFFER,ne.__webglFramebuffer),g.bindFramebuffer(O.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let et=0;et<Vt;et++)Gt&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,K.get(v).__webglTexture,J,ue+et),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,K.get(F).__webglTexture,Ct,R+et)),O.blitFramebuffer(Xt,oe,Dt,Pt,kt,y,Dt,Pt,O.DEPTH_BUFFER_BIT,O.NEAREST);g.bindFramebuffer(O.READ_FRAMEBUFFER,null),g.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(J!==0||v.isRenderTargetTexture||K.has(v)){let qt=K.get(v),Ut=K.get(F);g.bindFramebuffer(O.READ_FRAMEBUFFER,U),g.bindFramebuffer(O.DRAW_FRAMEBUFFER,Z);for(let ne=0;ne<Vt;ne++)Gt?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,qt.__webglTexture,J,ue+ne):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,qt.__webglTexture,J),gt?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ut.__webglTexture,Ct,R+ne):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ut.__webglTexture,Ct),J!==0?O.blitFramebuffer(Xt,oe,Dt,Pt,kt,y,Dt,Pt,O.COLOR_BUFFER_BIT,O.NEAREST):gt?O.copyTexSubImage3D(N,Ct,kt,y,R+ne,Xt,oe,Dt,Pt):O.copyTexSubImage2D(N,Ct,kt,y,Xt,oe,Dt,Pt);g.bindFramebuffer(O.READ_FRAMEBUFFER,null),g.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else gt?v.isDataTexture||v.isData3DTexture?O.texSubImage3D(N,Ct,kt,y,R,Dt,Pt,Vt,k,lt,C.data):F.isCompressedArrayTexture?O.compressedTexSubImage3D(N,Ct,kt,y,R,Dt,Pt,Vt,k,C.data):O.texSubImage3D(N,Ct,kt,y,R,Dt,Pt,Vt,k,lt,C):v.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,Ct,kt,y,Dt,Pt,k,lt,C.data):v.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,Ct,kt,y,C.width,C.height,k,C.data):O.texSubImage2D(O.TEXTURE_2D,Ct,kt,y,Dt,Pt,k,lt,C);g.pixelStorei(O.UNPACK_ROW_LENGTH,tt),g.pixelStorei(O.UNPACK_IMAGE_HEIGHT,it),g.pixelStorei(O.UNPACK_SKIP_PIXELS,It),g.pixelStorei(O.UNPACK_SKIP_ROWS,ht),g.pixelStorei(O.UNPACK_SKIP_IMAGES,yt),Ct===0&&F.generateMipmaps&&O.generateMipmap(N),g.unbindTexture()},this.initRenderTarget=function(v){K.get(v).__webglFramebuffer===void 0&&rt.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?rt.setTextureCube(v,0):v.isData3DTexture?rt.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?rt.setTexture2DArray(v,0):rt.setTexture2D(v,0),g.unbindTexture()},this.resetState=function(){Y=0,nt=0,j=null,g.reset(),Rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=_e._getDrawingBufferColorSpace(t),e.unpackColorSpace=_e._getUnpackColorSpace()}};var Fu={type:"change"},zc={type:"start"},Bu={type:"end"},ul=new zi,Ou=new In,U0=Math.cos(70*xc.DEG2RAD),en=new I,bn=2*Math.PI,Le={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Bc=1e-6,dl=class extends Hr{constructor(t,e=null){super(t,e),this.state=Le.NONE,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:qi.ROTATE,MIDDLE:qi.DOLLY,RIGHT:qi.PAN},this.touches={ONE:Yi.ROTATE,TWO:Yi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new Ln,this._lastTargetPosition=new I,this._quat=new Ln().setFromUnitVectors(t.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Qs,this._sphericalDelta=new Qs,this._scale=1,this._panOffset=new I,this._rotateStart=new Ft,this._rotateEnd=new Ft,this._rotateDelta=new Ft,this._panStart=new Ft,this._panEnd=new Ft,this._panDelta=new Ft,this._dollyStart=new Ft,this._dollyEnd=new Ft,this._dollyDelta=new Ft,this._dollyDirection=new I,this._mouse=new Ft,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=O0.bind(this),this._onPointerDown=F0.bind(this),this._onPointerUp=B0.bind(this),this._onContextMenu=X0.bind(this),this._onMouseWheel=H0.bind(this),this._onKeyDown=V0.bind(this),this._onTouchStart=G0.bind(this),this._onTouchMove=W0.bind(this),this._onMouseDown=z0.bind(this),this._onMouseMove=k0.bind(this),this._interceptControlDown=q0.bind(this),this._interceptControlUp=Y0.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Le.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Fu),this.update(),this.state=Le.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;en.copy(e).sub(this.target),en.applyQuaternion(this._quat),this._spherical.setFromVector3(en),this.autoRotate&&this.state===Le.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=bn:n>Math.PI&&(n-=bn),s<-Math.PI?s+=bn:s>Math.PI&&(s-=bn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(en.setFromSpherical(this._spherical),en.applyQuaternion(this._quatInverse),e.copy(this.target).add(en),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=en.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new I(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=en.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(ul.origin.copy(this.object.position),ul.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ul.direction))<U0?this.object.lookAt(this.target):(Ou.setFromNormalAndCoplanarPoint(this.object.up,this.target),ul.intersectPlane(Ou,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Bc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Bc||this._lastTargetPosition.distanceToSquared(this.target)>Bc?(this.dispatchEvent(Fu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?bn/60*this.autoRotateSpeed*t:bn/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){en.setFromMatrixColumn(e,0),en.multiplyScalar(-t),this._panOffset.add(en)}_panUp(t,e){this.screenSpacePanning===!0?en.setFromMatrixColumn(e,1):(en.setFromMatrixColumn(e,0),en.crossVectors(this.object.up,en)),en.multiplyScalar(t),this._panOffset.add(en)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;en.copy(s).sub(this.target);let r=en.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/e.clientHeight),this._rotateUp(bn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/e.clientHeight),this._rotateUp(bn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Ft,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function F0(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function O0(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function B0(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Bu),this.state=Le.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function z0(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case qi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Le.DOLLY;break;case qi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Le.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Le.ROTATE}break;case qi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Le.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Le.PAN}break;default:this.state=Le.NONE}this.state!==Le.NONE&&this.dispatchEvent(zc)}function k0(i){switch(this.state){case Le.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Le.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Le.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function H0(i){this.enabled===!1||this.enableZoom===!1||this.state!==Le.NONE||(i.preventDefault(),this.dispatchEvent(zc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Bu))}function V0(i){this.enabled!==!1&&this._handleKeyDown(i)}function G0(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Yi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Le.TOUCH_ROTATE;break;case Yi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Le.TOUCH_PAN;break;default:this.state=Le.NONE}break;case 2:switch(this.touches.TWO){case Yi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Le.TOUCH_DOLLY_PAN;break;case Yi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Le.TOUCH_DOLLY_ROTATE;break;default:this.state=Le.NONE}break;default:this.state=Le.NONE}this.state!==Le.NONE&&this.dispatchEvent(zc)}function W0(i){switch(this._trackPointer(i),this.state){case Le.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Le.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Le.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Le.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Le.NONE}}function X0(i){this.enabled!==!1&&i.preventDefault()}function q0(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Y0(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function zu(i,t=Math.PI/3){let e=i.index?i.toNonIndexed():i,n=e.attributes.position,s=n.count,r;if(n.isBufferAttribute===!0&&n.itemSize===3&&n.normalized===!1)r=n.array;else{r=new Float64Array(s*3);for(let M=0;M<s;M++)r[3*M+0]=n.getX(M),r[3*M+1]=n.getY(M),r[3*M+2]=n.getZ(M)}let a=Math.cos(t),o=(1+1e-10)*100,l=s/3,c=new Float64Array(l*3);for(let M=0;M<l;M++){let b=9*M,T=r[b+0],P=r[b+1],_=r[b+2],E=r[b+3],L=r[b+4],z=r[b+5],H=r[b+6],G=r[b+7],U=r[b+8],Z=H-E,Y=G-L,nt=U-z,j=T-E,$=P-L,st=_-z,W=Y*st-nt*$,Nt=nt*j-Z*st,ct=Z*$-Y*j,ve=1/(Math.sqrt(W*W+Nt*Nt+ct*ct)||1);c[3*M+0]=W*ve,c[3*M+1]=Nt*ve,c[3*M+2]=ct*ve}let u=new Int32Array(s),f=new Float64Array(s*3),h=1;for(;h<s*2;)h<<=1;let m=h-1,x=new Int32Array(h),S=0;for(let M=0;M<s;M++){let b=3*M,T=Math.trunc(r[b+0]*o),P=Math.trunc(r[b+1]*o),_=Math.trunc(r[b+2]*o),E=(Math.imul(T,73856093)^Math.imul(P,19349663)^Math.imul(_,83492791))&m;for(;;){let L=x[E];if(L===0){let H=3*S;f[H+0]=T,f[H+1]=P,f[H+2]=_,x[E]=S+1,u[M]=S++;break}let z=3*(L-1);if(f[z+0]===T&&f[z+1]===P&&f[z+2]===_){u[M]=L-1;break}E=E+1&m}}let p=new Int32Array(S+1);for(let M=0;M<s;M++)p[u[M]+1]++;for(let M=0;M<S;M++)p[M+1]+=p[M];let d=new Int32Array(s),w=p.slice(0,S);for(let M=0;M<l;M++){let b=3*M;d[w[u[b+0]]++]=M,d[w[u[b+1]]++]=M,d[w[u[b+2]]++]=M}let D=new Float32Array(s*3);for(let M=0;M<l;M++){let b=3*M,T=c[b+0],P=c[b+1],_=c[b+2];for(let E=0;E<3;E++){let L=b+E,z=u[L],H=0,G=0,U=0;for(let Y=p[z],nt=p[z+1];Y<nt;Y++){let j=3*d[Y],$=c[j+0],st=c[j+1],W=c[j+2];T*$+P*st+_*W>a&&(H+=$,G+=st,U+=W)}let Z=1/(Math.sqrt(H*H+G*G+U*U)||1);D[3*L+0]=H*Z,D[3*L+1]=G*Z,D[3*L+2]=U*Z}}return e.setAttribute("normal",new ke(D,3,!1)),e}var xn=Math.PI/180,qn={corners:"#a78bfa",rough:"#f59e0b",finish:"#38bdf8",finish2:"#2dd4bf",index:"#facc15",parting:"#f472b6"},ku="#4ade80";function gs(i,t,e=34){let n=document.createElement("canvas"),s=n.getContext("2d");s.font=`600 ${e}px system-ui, sans-serif`;let r=Math.ceil(s.measureText(i).width)+16;n.width=r,n.height=e+16,s.font=`600 ${e}px system-ui, sans-serif`,s.fillStyle=t,s.textBaseline="middle",s.fillText(i,8,n.height/2);let a=new Ks(n);a.colorSpace=$e;let o=new Xs(new ls({map:a,depthTest:!1,transparent:!0}));return o.renderOrder=10,o.userData.aspect=n.width/n.height,o}var Hu=.02;function kc(i,t,e,n=40){let s=document.createElement("canvas"),r=s.getContext("2d"),a=`650 ${n}px system-ui, sans-serif`;r.font=a;let o=Math.round(n*1.45),l=Math.max(o,Math.ceil(r.measureText(i).width+n*1));s.width=l,s.height=o;let c=o/2;r.fillStyle=t,r.beginPath(),r.moveTo(c,0),r.arcTo(l,0,l,o,c),r.arcTo(l,o,0,o,c),r.arcTo(0,o,0,0,c),r.arcTo(0,0,l,0,c),r.closePath(),r.fill(),r.font=a,r.fillStyle=e,r.textBaseline="middle",r.textAlign="center",r.fillText(i,l/2,o/2+n*.04);let u=new Ks(s);u.colorSpace=$e;let f=new Xs(new ls({map:u,depthTest:!1,transparent:!0,sizeAttenuation:!1}));return f.scale.set(Hu*l/o,Hu,1),f.renderOrder=32,f.userData.noHl=!0,f}function ri(i){i.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material:[t.material]).forEach(e=>{e.map&&e.map.dispose(),e.dispose()})})}function ji(i,t,e,n,s,r=48,a=!1){let o=new _n(t,i,n-e,r,1,a);return o.rotateZ(-Math.PI/2),o.translate((e+n)/2,0,0),new de(o,s)}function Vu(i,t={}){let e=new ll({antialias:!0,alpha:!0,preserveDrawingBuffer:!!t.preserveDrawingBuffer});e.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),e.outputColorSpace=$e,e.setClearColor(0,0),e.shadowMap.enabled=!0,e.shadowMap.type=us,e.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none",i.appendChild(e.domElement);let n=new Cr,s=new fn(26,1,1,4e4);s.up.set(0,0,1),s.position.set(-150,-600,300);let r=new dl(s,e.domElement);r.enableDamping=!0,r.dampingFactor=.12,r.screenSpacePanning=!0,r.target.set(100,0,0);let a=new zr(15922943,3818064,1.6);n.add(a);let o=new Xi(16777215,1.9);o.position.set(-.4,-1,1.3),n.add(o);let l=new Xi(12571903,.8);l.position.set(.7,1,.4),n.add(l);let c=new Xi(16777215,.7);s.add(c),c.position.set(0,0,1),n.add(s);let u=new qe;n.add(u);let f=new qe;n.add(f);let h=new qe;f.add(h);let m=new qe;f.add(m);let x=new qe;f.add(x);let S=[],p=null,d={},w={},D=1,M=0,b="finish",T="finish",P=null,_=null,E=!1,L=null,z="",H=!1,G=null,U=null,Z=!1,Y={ink:"#1e2a32",muted:"#5e6b75",accent:"#1abc9c",dark:!1},nt=new qe;f.add(nt);let j={list:[],opts:{},ghosts:[],drag:null},$=null,st=new Xi(16766814,0);st.castShadow=!0,st.shadow.mapSize.set(2048,2048),st.shadow.bias=-4e-4,f.add(st),f.add(st.target);let W=null,Nt=null,ct={};function ve(){Object.values(ct).forEach(R=>R.dispose()),delete ct.hl;let y=Y.dark?8226708:10134445;ct.metal=new Ve({color:y,metalness:.55,roughness:.42}),ct.metalDark=new Ve({color:Y.dark?4870749:6252658,metalness:.6,roughness:.4}),ct.housing=new Ve({color:Y.dark?10134445:12897235,metalness:.15,roughness:.55}),ct.stock=new Ve({color:14268812,transparent:!0,opacity:Y.dark?.12:.16,roughness:.9,depthWrite:!1,side:pi}),ct.stockEdge=new Mn({color:12884572,transparent:!0,opacity:.7}),ct.keep=new rn({color:14042437,transparent:!0,opacity:.13,depthWrite:!1,side:Ye}),ct.part=new Ve({color:Y.dark?10335446:8362948,metalness:.08,roughness:.55,side:Ye,shadowSide:an,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}),ct.partBad=new Ve({color:14051930,metalness:.05,roughness:.6,side:Ye}),ct.partReach=new Ve({color:15659250,metalness:0,roughness:.7,side:Ye,shadowSide:an,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1}),ct.shank=new Ve({color:13094098,metalness:.8,roughness:.25}),ct.sim=new Ve({vertexColors:!0,metalness:.05,roughness:.75,side:Ye}),ct.simPart=new Ve({color:new Ot(.5,.65,.86),metalness:.05,roughness:.75,side:Ye,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:2}),ct.simGhost=new Ve({vertexColors:!0,metalness:.05,roughness:.75,side:Ye,transparent:!0,opacity:.16,depthWrite:!1}),ct.overlay=new Ve({color:new Ot(qn.index),roughness:.6,metalness:.05}),ct.ghost=new Ve({color:new Ot(qn.index),transparent:!0,opacity:.32,depthWrite:!1,roughness:.5}),ct.ghostOn=new Ve({color:new Ot(qn.index),transparent:!0,opacity:.85,roughness:.4,emissive:new Ot(qn.index),emissiveIntensity:.25}),ct.ghostLine=new Ri({color:new Ot(qn.index),dashSize:2.5,gapSize:2,transparent:!0,opacity:.9}),ct.tenon=new Ve({color:new Ot(ku),transparent:!0,opacity:.5,roughness:.6,depthWrite:!1,side:Ye}),ct.tenonEdge=new Mn({color:new Ot(ku),transparent:!0,opacity:.95,depthTest:!1}),ct.axis=new Ri({color:Y.dark?15133938:1976882,dashSize:4,gapSize:3,transparent:!0,opacity:.55});for(let R of Object.keys(qn))ct[R]=new Mn({color:new Ot(qn[R])}),ct[R+"Tool"]=new Ve({color:new Ot(qn[R]),metalness:.4,roughness:.35})}ve();let ge=!0,zt=()=>{ge=!0};r.addEventListener("change",zt),r.addEventListener("start",()=>{hr=!0,t.onUserCamera&&t.onUserCamera()});let ot=0,pt=!0,Bt=()=>{if(!pt)return;ot=requestAnimationFrame(Bt);let y=r.update();if(ge||y){ge=!1;try{Ae()}catch{}e.render(n,s)}};Bt();let te=new Je,At=new Je,ee=new I,Ge=new I;function ce(y){let R=1/0,C=-1/0,k=1/0,lt=-1/0;for(let N of[y.min.x,y.max.x])for(let tt of[y.min.y,y.max.y])for(let it of[y.min.z,y.max.z])ee.set(N,tt,it).project(s),R=Math.min(R,ee.x),C=Math.max(C,ee.x),k=Math.min(k,ee.y),lt=Math.max(lt,ee.y);return[R,C,k,lt]}let xe=(y,R,C)=>{let k=Math.min(1,Math.max(0,(C-y)/(R-y)));return k*k*(3-2*k)};function Ae(){let y=E?_:p||Wt.stock&&Wt.stock[0];n.updateMatrixWorld(),s.updateMatrixWorld();for(let C of[P,L]){if(!C)continue;let k=C.children.filter(tt=>tt.userData.fade);if(!k.length)continue;let lt=0;if(C.visible&&y&&(te.makeEmpty(),k.forEach(tt=>te.expandByObject(tt)),At.makeEmpty(),At.expandByObject(y),!At.isEmpty())){let tt=ce(te),it=ce(At),It=Math.max(0,Math.min(tt[1],it[1])-Math.max(tt[0],it[0])),ht=Math.max(0,Math.min(tt[3],it[3])-Math.max(tt[2],it[2])),yt=It*ht/Math.max(1e-9,(it[1]-it[0])*(it[3]-it[2]));s.position.distanceTo(te.getCenter(Ge))<s.position.distanceTo(At.getCenter(ee))&&(lt=xe(.1,.35,yt))}let N=1-.8*lt;C.userData.opacity=N,k.forEach(tt=>We(tt.material,N))}if(!ye)return;let R=y?Ne(y):[];for(let C of["head","tail"]){let k=ye[C].filter(tt=>tt.isMesh&&tt.visible!==!1),lt=0;if(R.length&&k.length){let tt=0;for(let it of R){ee.copy(it).sub(s.position);let It=ee.length();he.set(s.position,ee.normalize()),he.far=It,he.intersectObjects(k,!1).length&&tt++}lt=xe(.08,.3,tt/R.length)}let N=1-.75*lt;ye.opacity[C]=N,ye[C].forEach(tt=>We(tt.material,N))}}let he=new Ci,ye=null;function We(y,R){if(!y||y===ct.hl)return;let C=R<.995;y.transparent!==C&&(y.transparent=C,y.depthWrite=!C,y.needsUpdate=!0),y.opacity=C?R:1}let Ke=[];function Ne(y){if(At.makeEmpty(),At.expandByObject(y),At.isEmpty())return[];let R=At,C=(R.min.y+R.max.y)/2,k=(R.min.z+R.max.z)/2,lt=(R.max.y-R.min.y)*.35,N=(R.max.z-R.min.z)*.35,tt=0;for(let it=0;it<5;it++){let It=R.min.x+(R.max.x-R.min.x)*(.1+.2*it);for(let[ht,yt]of[[C,k],[C+lt,k],[C-lt,k],[C,k+N],[C,k-N]])Ke[tt]||(Ke[tt]=new I),Ke[tt++].set(It,ht,yt)}return Ke.slice(0,tt)}function Be(){let y=i.clientWidth,R=i.clientHeight;!y||!R||(e.setSize(y,R,!1),s.aspect=y/R,s.updateProjectionMatrix(),zt())}let O=window.ResizeObserver?new ResizeObserver(Be):null;O&&O.observe(i),Be();let Wt={},Me={chuck:"rig.chuck.dia",head:"rig.head.len",centre:"rig.centre.dia",tail:"rig.tail.len",keepChuck:"chuck_clearance",keepTail:"tailstock_clearance"};function A(y){ri(u),u.clear(),ri(h),h.clear(),ri(x),x.clear(),W=y,Wt={chuck:[],head:[],centre:[],tail:[],stock:[],keepChuck:[],keepTail:[],origin:[]},ye={head:[],tail:[],opacity:{head:1,tail:1}};let R=(ae,le)=>{let Xe=le.clone();return Xe.userData.fadeSide=ae,Xe},C=(ae,le)=>{(Wt[ae]=Wt[ae]||[]).push(le),u.add(le),Me[ae]&&(le.userData.setting=Me[ae]);let Xe=ae==="chuck"||ae==="head"?"head":ae==="centre"||ae==="tail"?"tail":null;return Xe&&le.isMesh&&ye[Xe].push(le),le},k=y.stockR,lt=y.chuckX,N=y.fixtures||[],tt=ae=>N.find(le=>le.name===ae),it=tt("chuck")||{x0:lt-48,x1:lt,r:Math.max(k*1.5+6,30)},It=it.r,ht=Math.min(14,(it.x1-it.x0)/3),yt=it.x1-it.x0-ht;C("chuck",ji(It*.97,It*.97,it.x0,it.x1-ht,R("head",ct.housing),64));let Gt=R("head",ct.metalDark),gt=!(y.rig&&y.rig.chuck&&String(y.rig.chuck.jaws)==="3"),qt=y.stockShape==="round"||!y.stockHalf?[k,k]:y.stockHalf;for(let ae=0;ae<(gt?4:3);ae++){let le=gt?ae*90*xn:ae*120*xn+90*xn,Xe=gt?ae%2?qt[1]:qt[0]:y.stockShape==="round"?k:Math.min(k,Math.max(qt[0],qt[1])),Ue=gt?2*(ae%2?qt[0]:qt[1]):2*k,Hn=Math.max(4,It-Xe),Vn=Math.max(6,Math.min(k*.55,Ue*.7)),li=new de(new Nn(ht,Vn,Hn),Gt);li.position.set(it.x1-ht/2,Math.cos(le)*(Xe+Hn/2),Math.sin(le)*(Xe+Hn/2)),li.rotation.x=le-90*xn,li.userData.jaw=!0,li.userData.setting="rig.chuck.jaws",Wt.chuck.push(li),x.add(li),ye.head.push(li)}let Ut=(ae,le,Xe)=>{let Ue=-Math.max(le.top,It)-10,Hn=new Nn(le.x1-le.x0,le.y1-le.y0,le.top-Ue);Hn.translate((le.x0+le.x1)/2,(le.y0+le.y1)/2,(le.top+Ue)/2),C(ae,new de(Hn,R(Xe,ct.housing)));let Vn=new Ai(new $s(Hn),R(Xe,ct.stockEdge));u.add(Vn),ye[Xe].push(Vn)},ne=tt("headstock");ne&&Ut("head",ne,"head");let St=y.tailX,et=tt("live centre")||{x0:St,x1:St+Math.max(14,k*.8),r:Math.max(6,k*.45)},be=et.x1-et.x0,hn=et.r;C("centre",ji(.01,hn,et.x0,et.x1,R("tail",ct.metalDark),32));let An=N.find(ae=>ae.name==="live centre"&&ae.part==="body");An&&C("centre",ji(An.r,An.r,An.x0,An.x1,R("tail",ct.housing),48));let Jn=tt("tailstock");Jn&&Ut("tail",Jn,"tail");let pe=lt-(y.clamp>0?y.clamp:0),Bn=St;if(y.stockShape==="round"){let ae=ji(k,k,pe,Bn,ct.stock,72,!0);ae.renderOrder=2,h.add(ae),Wt.stock.push(ae),ae.userData.setting="stock";for(let le of[lt,St])h.add(new Js(new Te().setFromPoints(Array.from({length:73},(Xe,Ue)=>new I(le,k*Math.cos(Ue*5*xn),k*Math.sin(Ue*5*xn)))),ct.stockEdge))}else{let ae=new Nn(Bn-pe,y.stockHalf[0]*2,y.stockHalf[1]*2);ae.translate((pe+Bn)/2,0,0);let le=new de(ae,ct.stock);le.renderOrder=2,h.add(le),Wt.stock.push(le),le.userData.setting="stock",h.add(new Ai(new $s(ae),ct.stockEdge))}let Li=k+1.5;y.chuckClear>0&&C("keepChuck",ji(Li,Li,lt,lt+y.chuckClear,ct.keep,48,!0)),y.tailClear>0&&C("keepTail",ji(Li,Li,St-y.tailClear,St,ct.keep,48,!0));let ia=new Dn(new Te().setFromPoints([new I(it.x0-30,0,0),new I(St+be+90,0,0)]),ct.axis);ia.computeLineDistances(),u.add(ia);let ze=k+7,zn=St-Math.max(12,y.tailClear+6),kn=[];for(let ae=0;ae<=40;ae++){let le=(-50+ae*2.5)*xn;kn.push(new I(zn,-Math.sin(le)*ze,Math.cos(le)*ze))}u.add(new Dn(new Te().setFromPoints(D>0?kn:kn.slice().reverse()),new Mn({color:new Ot(Y.accent)})));let V=D>0?kn[kn.length-1]:kn[0],ut=D>0?kn[kn.length-3]:kn[2],Tt=new de(new cs(2.2,6,16),new rn({color:new Ot(Y.accent)}));Tt.position.copy(V),Tt.quaternion.setFromUnitVectors(new I(0,1,0),V.clone().sub(ut).normalize()),u.add(Tt),Wt.aHead=Tt;let ie=gs("A+",Y.accent);ie.position.set(zn,-ze*.9*D,ze*.75),ie.scale.set(8*ie.userData.aspect,8,1),u.add(ie);let jt=new qe,we=Math.max(10,Math.min(18,k*.55));jt.position.set(lt,0,0),[[1,0,0,"#d64545","X"],[0,1,0,"#2fa36b","Y"],[0,0,1,"#2a78d6","Z"]].forEach(([ae,le,Xe,Ue,Hn])=>{let Vn=new I(ae,le,Xe),li=new tr(Vn,new I,we,new Ot(Ue).getHex(),3.4,2.2);li.traverse(sa=>{sa.material&&(sa.material.depthTest=!1,sa.material.transparent=!0),sa.renderOrder=22}),jt.add(li);let ur=gs(Hn,Ue);ur.position.copy(Vn.clone().multiplyScalar(we+3.5)),ur.scale.set(4.5*ur.userData.aspect,4.5,1),ur.renderOrder=23,jt.add(ur)});let Rn=new de(new Hi(1.5,16,8),new rn({color:new Ot(Y.ink),depthTest:!1,transparent:!0}));Rn.renderOrder=23,jt.add(Rn);let ln=kc("G-code zero: X0 Y0 Z0",Y.dark?"#e6ecf2":"#1e2a32",Y.dark?"#1e2a32":"#ffffff");ln.scale.multiplyScalar(.8),ln.center.set(1.06,1.3),ln.renderOrder=24,ln.userData.origin=!0,jt.add(ln),jt.userData.origin=!0,u.add(jt),Wt.origin.push(jt);let es=Math.max(6,It*.16),ns=gs("chuck",Y.muted,28);ns.position.set(it.x0+yt/2,0,It+9),ns.scale.set(es*ns.userData.aspect,es,1),u.add(ns);let Di=gs("tailstock",Y.muted,28);if(Di.position.set(Jn?(Jn.x0+Jn.x1)/2:St+be+50,0,(Jn?Jn.top:It*.75)+9),Di.scale.set(es*Di.userData.aspect,es,1),u.add(Di),g(),He.key)try{Ii(!1)}catch{Zn(),He.key=null}zt()}function g(){P&&(u.remove(P),ri(P),P=null);let y=W&&W.tools&&W.tools[b];!y||!(y.dia>0)||(P=K(Object.assign({stickout:W.stickout&&W.stickout[b]},y),b),P.position.set(W.toolX!=null?W.toolX:(W.chuckX+W.tailX)/2,0,W.stockR+W.clear),P.visible=!E&&!(b==="index"&&j.list.length),u.add(P))}function X(y,R){let C=W&&W.rig||{},k=C.nut&&C.nut.dia||35,lt=C.nut&&C.nut.len||20,N=C.spindle&&C.spindle.dia||80,tt=new de(new _n(k/2,k/2,lt,6),ct.metalDark.clone());tt.rotation.x=Math.PI/2,tt.position.z=R+lt/2,tt.userData.part="nut",tt.userData.fade=!0,y.add(tt);let it=new de(new _n(N/2,N/2,90,48),ct.housing.clone());it.rotation.x=Math.PI/2,it.position.z=R+lt+45,it.userData.part="spindle",it.userData.fade=!0,y.add(it),y.userData.dims={so:R,nd:k,nl:lt,sd:N}}function K(y,R){let C=y.dia/2,k=y.len||20,lt=!!y.ball,N=y.stickout>0?y.stickout:k+6,tt=new qe,it=ct[R+"Tool"]||ct.finishTool;if(lt&&y.taper>0&&y.shank/2>C){let Gt=y.taper,gt=y.shank/2,qt=C*Math.cos(Gt),Ut=C-C*Math.sin(Gt),ne=Ut+(gt-qt)/Math.tan(Gt),St=[];for(let hn=0;hn<=12;hn++){let An=hn/12*(Math.PI/2-Gt);St.push(new Ft(C*Math.sin(An),C-C*Math.cos(An)))}St.push(new Ft(gt,ne));let et=Math.max(k,ne);et>ne&&St.push(new Ft(gt,et)),St.push(new Ft(0,et));let be=new de(new Fr(St,32),it);if(be.rotation.x=Math.PI/2,be.userData.part="flutes",tt.add(be),N>et){let hn=new de(new _n(gt,gt,N-et,32),ct.shank);hn.rotation.x=Math.PI/2,hn.position.z=(et+N)/2,hn.userData.part="shank",tt.add(hn)}return tt.userData.cut={tr:C,len:k,ball:!0,taper:Gt,rs:gt,rc:qt,zt:Ut,ztop:ne,top:et,so:N},X(tt,N),tt}if(lt){let Gt=new de(new Hi(C,32,16,0,Math.PI*2,Math.PI/2,Math.PI/2),it);Gt.rotation.x=Math.PI/2,Gt.position.z=C,Gt.userData.part="flutes",tt.add(Gt)}let It=lt?C:0,ht=Math.min(k,N),yt=new de(new _n(C,C,Math.max(.1,ht-It),32,1,!1),it);if(yt.rotation.x=Math.PI/2,yt.position.z=It+(ht-It)/2,yt.userData.part="flutes",tt.add(yt),N>ht){let Gt=new de(new _n(C,C,N-ht,32),ct.shank);Gt.rotation.x=Math.PI/2,Gt.position.z=(ht+N)/2,Gt.userData.part="shank",tt.add(Gt)}return tt.userData.cut={tr:C,len:k,ball:lt,taper:0,rs:C,top:ht,so:N},X(tt,N),tt}function rt(y,R={}){if(p&&(f.remove(p),p.geometry.dispose(),p=null),Nt=null,!y||!y.length){zt();return}let C=new Te;if(C.setAttribute("position",new ke(y,3)),C=zu(C,35*xn),C.computeBoundingBox(),Nt=C.boundingBox.clone(),_t=!!R.bad,p=new de(C,xt()),p.visible=at(),p.castShadow=p.receiveShadow=!0,f.add(p),j.list.length&&Ht(),He.key)try{Ii(!1)}catch{Zn(),He.key=null}zt()}let _t=!1,xt=()=>E&&Z&&!H?ct.simPart:st.intensity>0?ct.partReach:_t?ct.partBad:ct.part,at=()=>!E||H||Z;function ft(y){_t=!!y,p&&(p.material=xt(),zt())}function vt(y){S=y||[],ri(m),m.clear();for(let R of S){if(!(R.r>0)||!(R.x1>R.x0))continue;let C=ji(R.r,R.r,R.x0,R.x1,ct.tenon,64);C.renderOrder=4,C.userData.side=R.side,C.userData.setting="tenons."+R.side+".dia",m.add(C);for(let k of[R.side==="chuck"?R.in1:R.in0]){let lt=new Js(new Te().setFromPoints(Array.from({length:64},(N,tt)=>new I(k,R.r*Math.cos(tt*2*Math.PI/64),R.r*Math.sin(tt*2*Math.PI/64)))),ct.tenonEdge);lt.renderOrder=11,m.add(lt)}}m.visible=!E,zt()}function Yt(y,R,C){if(d[y]&&(f.remove(d[y]),d[y].geometry.dispose(),delete d[y]),!R||!R.length){zt();return}let k=Math.floor(R.length/4),lt=[],N=NaN,tt=0,it=0;for(let Gt=0;Gt<k;Gt++){let gt=Gt*4,qt=R[gt],Ut=R[gt+1],ne=R[gt+2],St=R[gt+3]*D*xn;if(!Number.isFinite(qt)||!Number.isFinite(ne)||!Number.isFinite(St)){N=NaN;continue}let et=Math.cos(St),be=Math.sin(St),hn=Ut*et+ne*be,An=-Ut*be+ne*et;Number.isFinite(N)&&lt.push(N,tt,it,qt,hn,An),N=qt,tt=hn,it=An}let It=new Te;It.setAttribute("position",new ke(new Float32Array(lt),3));let ht=C?w[C]||(w[C]=new Mn({color:new Ot(C)})):ct[y]||ct.finish,yt=new Ai(It,ht);yt.renderOrder=3,yt.visible=y===T&&!E,d[y]=yt,f.add(yt),zt()}function wt(y,R){if(b=y,T=R||y,Object.keys(d).forEach(C=>{d[C].visible=C===T&&!E}),g(),He.key)try{Ii(!1)}catch{Zn(),He.key=null}zt()}function Mt(y){M=y,f.rotation.x=y%360*D*xn,zt()}function Zt(y){if(_&&(f.remove(_),_.geometry.dispose(),_=null),!y){zt();return}let R=new Te;R.setAttribute("position",new ke(y.pos,3)),R.setAttribute("color",new ke(y.col,3)),R.setIndex(new ke(y.index,1)),y.count!==void 0&&R.setDrawRange(0,y.count),R.computeVertexNormals(),_=new de(R,H?ct.simGhost:ct.sim),_.renderOrder=H?5:0,_.visible=E,f.add(_),zt()}function Kt(y,R){if(!_)return;let C=_.geometry;y&&(!C.index||C.index.array!==y?C.setIndex(new ke(y,1)):C.index.needsUpdate=!0,C.setDrawRange(0,R!==void 0?R:y.length)),C.attributes.position.needsUpdate=!0,C.attributes.color.needsUpdate=!0,C.computeVertexNormals(),C.computeBoundingSphere(),zt()}function re(y){if(!y){G&&(f.remove(G),G.geometry.dispose(),G.dispose(),G=null),U=null,zt();return}if(!G||U!==y){G&&(f.remove(G),G.geometry.dispose(),G.dispose());let k=Math.max(.2,y.s*.9);G=new Ys(new Nn(k,k,k),ct.overlay,Math.max(1,y.n)),G.frustumCulled=!1,U=y,f.add(G)}let R=new Ee,C=0;for(let k=0;k<y.n;k++)y.alive[k]&&(R.makeTranslation(y.x[k],y.y[k],y.z[k]),G.setMatrixAt(C++,R));G.count=C,G.instanceMatrix.needsUpdate=!0,G.visible=E,zt()}function B(y){H=!!y,_&&(_.material=H?ct.simGhost:ct.sim,_.renderOrder=H?5:0),p&&(p.visible=at(),p.material=xt()),zt()}function bt(y){Z!==!!y&&(Z=!!y,p&&(p.visible=at(),p.material=xt()),zt())}function dt(y){E=!!y,_&&(_.visible=E),G&&(G.visible=E),p&&(p.visible=at()),h.visible=!E,m.visible=!E,P&&(P.visible=!E&&!(b==="index"&&j.list.length)),L&&(L.visible=E),nt.visible=!E,wn.visible=!E,$&&($.visible=!E),st.intensity=E?0:j.opts.pick>=0&&j.list[j.opts.pick]?mt:0,Re(!E&&st.intensity>0),p&&(p.material=xt()),Object.keys(d).forEach(R=>{d[R].visible=R===T&&!E}),zt()}function Et(y,R,C,k,lt){let N=y?R+":"+y.dia+":"+y.ball+":"+(y.taper||0)+":"+(y.shank||0)+":"+(y.stickout||0):"";N!==z&&(L&&(n.remove(L),ri(L),L=null),z=N,y&&(L=K(y,R),n.add(L))),L&&(L.visible=E,L.position.set(C,k,lt)),zt()}let Rt=y=>y*D*xn,mt=3.4;function Jt(y,R){let C=K(Object.assign({stickout:W&&W.stickout&&W.stickout.index},y),"index");return C.traverse(k=>{k.isMesh&&(k.material=R?ct.ghostOn:ct.ghost,k.renderOrder=6,k.userData.idxGhost=!0)}),C}function Ht(){ri(nt),nt.clear(),j.ghosts=[];let y=j.opts,R=y.tool;if(st.intensity=0,!j.list.length||!R||!(R.dia>0)){Re(!1),P&&(P.visible=!E),zt();return}let C=y.x!=null?y.x:Nt?(Nt.min.x+Nt.max.x)/2:100,k=y.rTip||25;j.list.forEach((N,tt)=>{let it=tt===y.pick,It=new qe;It.position.set(C,0,0),It.rotation.x=-Rt(N.a);let ht=Jt(R,it);ht.position.set(0,0,k),ht.traverse(qt=>{qt.isMesh&&(qt.userData.idx=tt)}),It.add(ht);let yt=new Dn(new Te().setFromPoints([new I(0,0,0),new I(0,0,k)]),ct.ghostLine);yt.computeLineDistances(),It.add(yt);let Gt=gs("A"+Math.round(N.a*10)/10+"\xB0",qn.index,30),gt=(R.len||20)+50;Gt.position.set(0,0,k+gt+8),Gt.scale.set(7*Gt.userData.aspect,7,1),It.add(Gt),j.ghosts.push({pivot:It,label:Gt,a:N.a}),nt.add(It)});let lt=y.pick>=0&&j.list[y.pick];if(lt){let N=Nt||new Je(new I(0,-30,-30),new I(200,30,30)),tt=Math.max(N.max.x-N.min.x,N.max.y-N.min.y,N.max.z-N.min.z)*.6+10,it=(N.min.x+N.max.x)/2,It=Rt(lt.a);st.position.set(it,Math.sin(It)*tt*3,Math.cos(It)*tt*3),st.target.position.set(it,0,0);let ht=st.shadow.camera;ht.left=-tt,ht.right=tt,ht.top=tt,ht.bottom=-tt,ht.near=.5,ht.far=tt*6,ht.updateProjectionMatrix(),st.shadow.normalBias=Math.max(.02,tt/2048*1.5),st.intensity=mt}Re(!!lt),p&&(p.material=xt()),P&&(P.visible=!E&&b!=="index"),zt()}function Re(y){a.intensity=y?.55:1.6,o.intensity=y?0:1.9,l.intensity=y?0:.8,c.intensity=y?.25:.7,a.color.set(y?12110079:15922943)}function Se(y,R={}){j.list=(y||[]).map(C=>({a:Number(C.a)||0})),j.opts=R,j.drag||Ht()}function En(y){if($&&(f.remove($),$.geometry.dispose(),$.dispose(),$=null),y&&y.n){let R=Math.max(.2,y.s*.9);$=new Ys(new Nn(R,R,R),ct.overlay,y.n);let C=new Ee;for(let k=0;k<y.n;k++)C.makeTranslation(y.x[k],y.y[k],y.z[k]),$.setMatrixAt(k,C);$.instanceMatrix.needsUpdate=!0,$.visible=!E,f.add($)}zt()}function Tn(y){let R=e.domElement.getBoundingClientRect(),C=new Ci;C.setFromCamera(new Ft((y.clientX-R.left)/R.width*2-1,-((y.clientY-R.top)/R.height)*2+1),s);let k=C.ray.origin,lt=C.ray.direction,N=j.opts.rTip||25,tt=j.opts.x!=null?j.opts.x:0,it=null,It=null,ht=lt.y*lt.y+lt.z*lt.z,yt=2*(k.y*lt.y+k.z*lt.z),Gt=k.y*k.y+k.z*k.z-N*N,gt=yt*yt-4*ht*Gt;if(Math.abs(lt.x)<.45&&ht>1e-9&&gt>=0){let Ut=(-yt-Math.sqrt(gt))/(2*ht);it=k.y+Ut*lt.y,It=k.z+Ut*lt.z}else if(Math.abs(lt.x)>1e-6){let Ut=(tt-k.x)/lt.x;it=k.y+Ut*lt.y,It=k.z+Ut*lt.z}return it===null||Math.hypot(it,It)<1e-6?null:((Math.atan2(it,It)/xn+M*D)*D%360+360)%360}let wn=new qe;n.add(wn);let On=null;function Qr(y){if(On=y,ri(wn),wn.clear(),!y||!y.change){zt();return}let R=W&&W.fixtures||[],C=Math.max(40,...R.map(N=>N.kind==="box"?N.top:N.r))+25,k=(N,tt,it,It)=>{let ht=new qe,yt=new de(new _n(3,3,C,16),new Ve({color:new Ot(it),roughness:.5}));yt.userData.part=It,ht.userData.part=It,yt.userData.setting="rig.tc."+It+".x",yt.rotation.x=Math.PI/2,yt.position.z=C/2-20,ht.add(yt);let Gt=gs(tt,it,28);Gt.position.set(0,0,C+8),Gt.scale.set(13*Gt.userData.aspect,13,1),ht.add(Gt),ht.position.set(N.x,N.y,0),wn.add(ht)};k(y.change,"tool change","#a855f7","change"),y.setter&&k(y.setter,"tool setter","#64748b","setter");let lt=new Ri({color:new Ot("#a855f7"),dashSize:6,gapSize:4,transparent:!0,opacity:.9});if((y.paths||[]).slice(0,1).forEach(N=>{let tt=new Dn(new Te().setFromPoints(N.map(([it,It])=>new I(it,It,C-20))),lt);tt.computeLineDistances(),tt.userData.part="route",wn.add(tt)}),y.setter){let N=new Dn(new Te().setFromPoints([new I(y.change.x,y.change.y,C-20),new I(y.setter.x,y.setter.y,C-20)]),new Ri({color:new Ot(y.setterHits?"#d64545":"#64748b"),dashSize:3,gapSize:4}));N.computeLineDistances(),wn.add(N)}if(wn.visible=!E,He.key)try{Ii(!1)}catch{Zn(),He.key=null}zt()}let Ce=new qe;n.add(Ce);let Yn=new qe;f.add(Yn);let He={key:null,text:"",swapped:[]},on=y=>new I(y[0],y[1],y[2]);function yn(){let y={};return new Ot(Y.accent).getHSL(y,$e),new Ot().setHSL(y.h,Math.min(1,y.s*(Y.dark?.75:1)),Y.dark?.8:.25,$e)}function ai(y){return kc(y,"#"+yn().getHexString(),Y.dark?"#0d1f1b":"#ffffff")}function Qi(y,R,C,k,lt,N,tt={}){let it=yn(),It=new Mn({color:it,depthTest:!1,transparent:!0}),ht=on(C),yt=on(k),Gt=[];R&&Gt.push(on(R),ht),lt&&Gt.push(on(lt),yt),Gt.push(ht,yt);let gt=new Ai(new Te().setFromPoints(Gt),It);gt.renderOrder=30,y.add(gt);let qt=ht.distanceTo(yt),Ut=yt.clone().sub(ht).normalize(),ne=Math.max(1.2,Math.min(4,qt/4));if(qt>.01&&!tt.plain)for(let[St,et]of[[ht,Ut.clone().negate()],[yt,Ut]]){let be=new de(new cs(ne*.35,ne,12),new rn({color:it,depthTest:!1,transparent:!0}));be.quaternion.setFromUnitVectors(new I(0,1,0),et),be.position.copy(St).addScaledVector(et,-ne/2),be.renderOrder=30,y.add(be)}if(N){let St=tt.muted?kc(N,Y.dark?"#3a4652":"#e3e8ee",Y.dark?"#e6ecf2":"#1e2a32"):ai(N),et=ht.clone().add(yt).multiplyScalar(.5);cr(St,et,tt.off?on(tt.off):R?ht.clone().sub(on(R)):new I(0,0,1)),y.add(St)}}function cr(y,R,C){C=C.clone(),C.lengthSq()<1e-9&&C.set(0,0,1),C.normalize(),y.position.copy(R);let k=new Ft,lt=new I,N=new I;return y.onBeforeRender=(tt,it,It)=>{tt.getSize(k),y.parent.updateMatrixWorld(),lt.copy(R).applyMatrix4(y.parent.matrixWorld).project(It),N.copy(R).add(C).applyMatrix4(y.parent.matrixWorld).project(It);let ht=(N.x-lt.x)*k.x,yt=(N.y-lt.y)*k.y,Gt=Math.hypot(ht,yt);Gt<1e-6?(ht=0,yt=1):(ht/=Gt,yt/=Gt);let gt=y.scale.y/Math.tan((It.fov||26)*xn/2)*k.y/2,qt=gt*y.scale.x/y.scale.y,Ut=Math.abs(ht)*qt/2+Math.abs(yt)*gt/2+5;y.center.set(.5-ht*Ut/qt,.5-yt*Ut/gt)},y}function oi(y,R,C){let k=new de(new Hi(C,16,8),new rn({color:yn(),depthTest:!1,transparent:!0}));k.position.copy(on(R)),k.renderOrder=30,y.add(k)}function ta(){return ct.hl||(ct.hl=new Ve({color:new Ot(Y.accent),emissive:new Ot(Y.accent),emissiveIntensity:.35,transparent:!0,opacity:.88,roughness:.5,side:Ye})),ct.hl}function Zn(){(Wt.origin||[]).forEach(y=>y.children.forEach(R=>{R.userData.origin&&(R.visible=!0)})),He.swapped.forEach(([y,R])=>{y.material=R}),He.swapped=[],ri(Ce),Ce.clear(),ri(Yn),Yn.clear()}function ea(y){y.forEach(R=>R&&R.traverse(C=>{C.isMesh&&!C.isSprite&&!C.userData.noHl&&(He.swapped.push([C,C.material]),C.material=ta())}))}let na=/^op\.(tool_dia|tool_length|shank_dia|taper_deg|stepdown|pitch|stepover|leave)$/,ts=null,hr=!1;function fl(y,R,C=!0,k=!1){He.key=y||null,He.text=R||"";let lt=!!y&&na.test(y.replace(/^(corners|rough|finish|finish2|index|parting)./,"op."));ts&&(!y||k&&!lt)&&(hr||Ct(ts),ts=null);let N=!1;try{N=Ii(C)}catch{return Zn(),He.key=null,zt(),!1}return N&&k&&lt&&pl(),N}function pl(){let y=new Je;if(Ce.children.forEach(N=>{N.isSprite||y.expandByObject(N)}),y.isEmpty())return;s.updateMatrixWorld();let R=1/0,C=-1/0;for(let N of[y.min.x,y.max.x])for(let tt of[y.min.y,y.max.y])for(let it of[y.min.z,y.max.z]){let It=new I(N,tt,it).project(s);R=Math.min(R,It.y),C=Math.max(C,It.y)}if((C-R)/2>.3)return;ts||(ts=J()),hr=!1;let k=y.getSize(new I),lt=Math.max(k.x,k.y,k.z);y.expandByScalar(Math.max(lt*.35,5)),q(y,s.position.clone().sub(r.target).normalize())}function Ii(y){Zn();let R=He.key,C=He.text;if(!R||!W)return zt(),!1;(Wt.origin||[]).forEach(V=>V.children.forEach(ut=>{ut.userData.origin&&(ut.visible=!1)}));let k=W.fixtures||[],lt=V=>k.find(ut=>ut.name===V),N=lt("chuck"),tt=lt("headstock"),it=lt("live centre"),It=lt("tailstock"),ht=W.stockR,yt=W.chuckX,Gt=W.tailX,gt=[],qt=0,Ut=(...V)=>{Qi(Ce,...V),qt++},ne=(...V)=>{Qi(Yn,...V),qt++},St=P&&P.userData.dims,et=P&&P.position,be=V=>P?P.children.filter(ut=>V(ut.userData.part)):[],hn=(R.match(/^(corners|rough|finish|finish2|index|parting)./)||[])[1],An=!hn||hn===b,Jn=V=>V!=="nut"&&V!=="spindle",pe=An&&P?P.userData.cut:null,Bn=W.steps&&W.steps[b]||{},Li=(V,ut,Tt,ie=Math.max(pe.tr,1))=>{let jt=pe.tr,we=new de(new _n(jt,jt,ie,32,1,!0),new rn({color:new Ot(Y.accent),wireframe:!0,transparent:!0,opacity:.5,depthTest:!1}));we.rotation.x=Math.PI/2,we.position.set(V,ut,Tt+ie/2),we.renderOrder=29,Ce.add(we)},ia=(V,ut,Tt,ie)=>{let jt=pe.tr,we=new de(new _n(jt,jt,Math.max(.05,ie-Tt),40),new rn({color:new Ot(Y.accent),transparent:!0,opacity:.6,depthTest:!1}));we.rotation.x=Math.PI/2,we.position.set(V,ut,(Tt+ie)/2),we.renderOrder=29,Ce.add(we)},ze=R.replace(/^(corners|rough|finish|finish2|index|parting)./,"op."),zn=(V,ut)=>V?(gt.push(...Wt[ut]||[]),V):null;switch(ze){case"rig.chuck.dia":if(zn(N,"chuck")){let V=(N.x0+N.x1)/2;Ut([V,0,N.r],[V,-N.r-14,N.r],[V,-N.r-14,-N.r],[V,0,-N.r],C)}break;case"rig.chuck.len":zn(N,"chuck")&&Ut([N.x0,0,N.r],[N.x0,0,N.r+14],[N.x1,0,N.r+14],[N.x1,0,N.r],C);break;case"rig.head.len":case"rig.tail.len":{let V=zn(/head/.test(ze)?tt:It,/head/.test(ze)?"head":"tail");V&&Ut([V.x0,V.y0,V.top],[V.x0,V.y0,V.top+14],[V.x1,V.y0,V.top+14],[V.x1,V.y0,V.top],C);break}case"rig.head.front":case"rig.head.back":case"rig.tail.front":case"rig.tail.back":{let V=zn(/head/.test(ze)?tt:It,/head/.test(ze)?"head":"tail");if(!V)break;let ut=/front/.test(ze)?V.y0:V.y1,Tt=/head/.test(ze)?V.x1:V.x0;Ut([Tt,0,V.top],[Tt,0,V.top+14],[Tt,ut,V.top+14],[Tt,ut,V.top],C),Ut([Tt,0,0],[Tt,0,V.top+14],[Tt,0,V.top+14],null,""),oi(Ce,[Tt,0,0],2);break}case"rig.head.top":case"rig.tail.top":{let V=zn(/head/.test(ze)?tt:It,/head/.test(ze)?"head":"tail");if(!V)break;let ut=/head/.test(ze)?V.x1:V.x0;Ut([ut,V.y0,0],[ut,V.y0-14,0],[ut,V.y0-14,V.top],[ut,V.y0,V.top],C),Ut([ut,0,0],[ut,V.y0-14,0],[ut,V.y0-14,0],null,""),oi(Ce,[ut,0,0],2);break}case"rig.chuck.jaws":zn(N,"chuck");break;case"rig.tc.ztop":{let V=W.rig&&W.rig.tc&&Number(W.rig.tc.ztop);if(!isFinite(V)||W.rig.tc.ztop===null)break;let ut=et?et.x:(yt+Gt)/2;Ut([ut,-ht-6,0],[ut,-ht-18,0],[ut,-ht-18,V],[ut,-ht-6,V],C);let Tt=new de(new hs(Gt-yt+80,2*ht+60),new rn({color:yn(),transparent:!0,opacity:.12,depthWrite:!1,side:Ye}));Tt.position.set((yt+Gt)/2,0,V),Tt.renderOrder=28,Ce.add(Tt),P&&gt.push(...be(()=>!0));break}case"rig.corner":case"rig.corner.dx":case"rig.corner.dy":case"rig.corner.dz":{let V=C&&typeof C=="object"?C:{},ut=W.rig&&W.rig.corner||{},Tt=Ue=>Ue==null||Ue===""||!isFinite(Number(Ue))?null:Number(Ue),ie=Tt(ut.dx)||0,jt=Tt(ut.dy)||0,we=Tt(ut.dz)||0,Rn=[yt,0,0];if(oi(Ce,Rn,2.2),!ie&&!jt&&!we){let Ue=ai("set the offsets to see the corner");Ue.center.set(.5,-.6),Ue.position.set(yt,0,0),Ce.add(Ue),qt++;break}let ln=[yt-ie,-jt,-we],es=[yt,-jt,-we],ns=[yt,0,-we],Di=Ue=>ze==="rig.corner"||ze==="rig.corner."+Ue;Math.abs(ie)>.01&&Ut(null,ln,es,null,V.x||"",{off:[0,0,Math.sign(-we)||1],muted:!Di("dx")}),Math.abs(jt)>.01&&Ut(null,es,ns,null,V.y||"",{off:[1,0,0],muted:!Di("dy")}),Math.abs(we)>.01&&Ut(null,ns,Rn,null,V.z||"",{off:[0,-(Math.sign(jt)||1),0],muted:!Di("dz")});let ae=new Dn(new Te().setFromPoints([on(ln),on(Rn)]),new Ri({color:yn(),dashSize:3,gapSize:2.5,depthTest:!1,transparent:!0,opacity:.8}));ae.computeLineDistances(),ae.renderOrder=30,Ce.add(ae);let le=new de(new Hi(2.4,16,8),new rn({color:new Ot(Y.accent),depthTest:!1,transparent:!0}));le.position.copy(on(ln)),le.renderOrder=31,Ce.add(le);let Xe=[];Math.abs(ie)>.01&&Xe.push(new I(-Math.sign(ie),0,0)),Math.abs(jt)>.01&&Xe.push(new I(0,Math.sign(jt),0)),Math.abs(we)>.01&&Xe.push(new I(0,0,Math.sign(we))),Xe.forEach(Ue=>{let Hn=new tr(Ue,on(ln).addScaledVector(Ue,-17),14,new Ot(Y.accent).getHex(),4.5,3);Hn.traverse(Vn=>{Vn.material&&(Vn.material.depthTest=!1,Vn.material.transparent=!0),Vn.renderOrder=31}),Ce.add(Hn)}),Ce.add(cr(ai("touch off this corner"),on(ln),on(ln).sub(on(Rn)).add(new I(0,0,.3*Math.hypot(ie,jt,we))))),qt++;break}case"tenons.chuck.dia":case"tenons.chuck.depth":case"tenons.chuck.len":case"tenons.tailstock.dia":case"tenons.tailstock.depth":case"tenons.tailstock.len":{let V=/chuck/.test(ze)?"chuck":"tailstock",ut=S.find(jt=>jt.side===V)||S[0];if(!ut)break;m.children.forEach(jt=>{jt.isMesh&&jt.userData.side===ut.side&&gt.push(jt)});let Tt=ut.r,ie=-Math.max(Tt,ht)-10;if(/\.dia$/.test(ze)){let jt=ut.side==="chuck"?ut.x0+2:ut.x1-2;Ut([jt,0,Tt],[jt,-ht-10,Tt],[jt,-ht-10,-Tt],[jt,0,-Tt],C)}else if(/\.depth$/.test(ze))Ut([ut.in0,0,-Tt],[ut.in0,0,ie],[ut.in1,0,ie],[ut.in1,0,-Tt],C);else{let jt=ut.side==="chuck"?ut.x0:ut.in1,we=ut.side==="chuck"?ut.in0:ut.x1;Ut([jt,0,-Tt],[jt,0,ie],[we,0,ie],[we,0,-Tt],C)}break}case"rig.centre.dia":zn(it,"centre")&&Ut([it.x1,0,it.r],[it.x1,-it.r-14,it.r],[it.x1,-it.r-14,-it.r],[it.x1,0,-it.r],C);break;case"rig.centre.len":zn(it,"centre")&&Ut([it.x0,0,0],[it.x0,0,it.r+14],[it.x1,0,it.r+14],[it.x1,0,it.r],C);break;case"rig.centre.total":{if(!zn(it,"centre"))break;let V=k.find(Tt=>Tt.name==="live centre"&&Tt.part==="body"),ut=V?V.x1:it.x1;Ut([it.x0,0,0],[it.x0,0,it.r+22],[ut,0,it.r+22],[ut,0,it.r],C);break}case"tailstock_x":{gt.push(...Wt.stock);let V=yt-(W.clamp||0);Ut([V,0,-ht],[V,0,-ht-16],[Gt,0,-ht-16],[Gt,0,-ht],C);break}case"stock.clamp":{let V=W.clamp||0;if(V>0){let ut=new rn({color:new Ot(Y.accent),transparent:!0,opacity:.55,depthTest:!1}),Tt;if(W.stockShape==="round")Tt=ji(ht+.3,ht+.3,yt-V,yt,ut,72);else{let ie=W.stockHalf||[ht,ht],jt=new Nn(V,2*ie[0]+.6,2*ie[1]+.6);jt.translate(yt-V/2,0,0),Tt=new de(jt,ut)}Tt.renderOrder=29,Yn.add(Tt)}Ut([yt-V,0,-ht],[yt-V,0,-ht-8],[yt,0,-ht-8],[yt,0,-ht],C);break}case"chuck_clearance":gt.push(...Wt.keepChuck),Ut([yt,0,-ht],[yt,0,-ht-10],[yt+W.chuckClear,0,-ht-10],[yt+W.chuckClear,0,-ht],C);break;case"tailstock_clearance":gt.push(...Wt.keepTail),Ut([Gt-W.tailClear,0,-ht],[Gt-W.tailClear,0,-ht-10],[Gt,0,-ht-10],[Gt,0,-ht],C);break;case"model.part_start_x":if(Nt){p&&gt.push(p);let V=Nt.min.x-(W.lead||0);Ut([yt,0,0],[yt,0,-ht-24],[V,0,-ht-24],[V,0,0],C)}break;case"model.scale":case"model.roll":case"model.centre":case"model.axis":case"model.flip":p&&gt.push(p);break;case"stock.dia":{gt.push(...Wt.stock);let V=(yt+Gt)/2;Ut([V,0,ht],[V,-ht-12,ht],[V,-ht-12,-ht],[V,0,-ht],C);break}case"stock.width":case"stock.height":{gt.push(...Wt.stock);let V=W.stockHalf||[ht,ht],ut=yt+10;ze==="stock.width"?ne([ut,-V[0],V[1]],[ut,-V[0],V[1]+12],[ut,V[0],V[1]+12],[ut,V[0],V[1]],C):ne([ut,-V[0],V[1]],[ut,-V[0]-12,V[1]],[ut,-V[0]-12,-V[1]],[ut,-V[0],-V[1]],C);break}case"safe_clearance":et&&(gt.push(...be(Jn)),Ut([et.x-8,0,ht],[et.x-14,0,ht],[et.x-14,0,et.z],[et.x-8,0,et.z],C));break;case"op.stickout":if(St){gt.push(...be(Jn));let V=-St.nd/2-10;Ut([et.x,0,et.z],[et.x,V,et.z],[et.x,V,et.z+St.so],[et.x,-St.nd/2,et.z+St.so],C)}break;case"op.tool":et&&gt.push(...be(Jn));break;case"op.tool_dia":if(pe){gt.push(...be(ie=>ie==="flutes"));let V=pe.tr,ut=et.z+(pe.ball?V:0),Tt=-Math.max(V,3)-8;Ut([et.x-V,0,ut],[et.x-V,Tt,ut],[et.x+V,Tt,ut],[et.x+V,0,ut],C)}break;case"op.tool_length":if(pe){gt.push(...be(ie=>ie==="flutes"));let V=Math.max(pe.tr,pe.taper?pe.rs:0),ut=et.x+V+8,Tt=et.z+pe.len;Ut([et.x+V,0,et.z],[ut,0,et.z],[ut,0,Tt],[et.x+V,0,Tt],C)}break;case"op.shank_dia":if(pe){gt.push(...be(ie=>ie==="shank"||pe.taper>0&&ie==="flutes"));let V=pe.rs,ut=et.z+(pe.so>pe.top?(pe.top+pe.so)/2:pe.top),Tt=-Math.max(V,3)-8;Ut([et.x-V,0,ut],[et.x-V,Tt,ut],[et.x+V,Tt,ut],[et.x+V,0,ut],C)}break;case"op.taper_deg":if(pe&&pe.taper>0){gt.push(...be(Tt=>Tt==="flutes"));let V=[et.x+pe.rc,0,et.z+pe.zt],ut=et.z+pe.ztop+6;Qi(Ce,null,V,[et.x+pe.rc,0,ut],null,"",{plain:!0}),Qi(Ce,null,V,[et.x+pe.rs+(ut-et.z-pe.ztop)*Math.tan(pe.taper),0,ut],null,C,{plain:!0,off:[1,0,0]}),qt++}break;case"op.stepdown":if(pe&&Bn.stepdown>0){let V=pe.tr,ut=Bn.stepdown,Tt=et.x-V-8;ia(et.x,0,et.z-ut,et.z),Ut([et.x-V,0,et.z],[Tt,0,et.z],[Tt,0,et.z-ut],[et.x-V,0,et.z-ut],C)}break;case"op.pitch":if(pe&&Bn.pitch>0){let V=Bn.pitch,ut=et.z-5;Li(et.x+V,0,et.z),Ut([et.x,0,et.z],[et.x,0,ut],[et.x+V,0,ut],[et.x+V,0,et.z],C)}break;case"op.stepover":if(pe&&Bn.stepover>0){let V=Bn.stepover,ut=et.z-5;Li(et.x,V,et.z),Ut([et.x,0,et.z],[et.x,0,ut],[et.x,V,ut],[et.x,V,et.z],C)}break;case"op.leave":if(pe&&Bn.leave>=0){gt.push(...be(ie=>ie==="flutes")),p&&gt.push(p);let V=pe.tr,ut=Bn.leave,Tt=et.x+V+8;Ut([et.x+V,0,et.z],[Tt,0,et.z],[Tt,0,et.z-ut],[et.x-V,0,et.z-ut],C)}break;case"below_axis":if(pe){gt.push(...be(ie=>ie==="flutes"));let V=W.below||{},ut=V.cap!==null&&V.cap!==void 0?V.cap:V.used||0,Tt=-ht-14;if(oi(Ce,[et.x,0,0],2),ut>0)Li(et.x,0,-ut),Ut([et.x,0,0],[et.x,Tt,0],[et.x,Tt,-ut],[et.x,0,-ut],C);else{let ie=ai(C);ie.center.set(.5,0),ie.position.set(et.x,Tt,4),Ce.add(ie),Ut([et.x,0,0],[et.x,Tt,4],[et.x,Tt,4],null,"")}qt++}break;case"angle_step_deg":if(et){let V=Math.max(.5,Number(W.angleStep)||2),ut=[],Tt=et.x;for(let we=0;we<360-1e-6;we+=V){let Rn=we*xn;ut.push(new I(Tt,0,0),new I(Tt,ht*Math.sin(Rn),ht*Math.cos(Rn)))}let ie=new Ai(new Te().setFromPoints(ut),new Mn({color:yn(),depthTest:!1,transparent:!0,opacity:.7}));ie.renderOrder=30,Yn.add(ie);let jt=ai(C+" apart");jt.center.set(.5,0),jt.position.set(Tt,0,ht+4),Ce.add(jt),qt++}break;case"stock.shape":gt.push(...Wt.stock);break;case"tenons.ends":case"tenons.same":m.children.forEach(V=>{V.isMesh&&gt.push(V)});break;case"rig.nut.dia":if(St){gt.push(...be(Tt=>Tt==="nut"));let V=et.z+St.so+St.nl/2,ut=-St.nd/2-10;Ut([et.x-St.nd/2,-St.nd/4,V],[et.x-St.nd/2,ut,V],[et.x+St.nd/2,ut,V],[et.x+St.nd/2,-St.nd/4,V],C)}break;case"rig.nut.len":if(St){gt.push(...be(ut=>ut==="nut"));let V=et.x+St.nd/2+10;Ut([et.x+St.nd/2,0,et.z+St.so],[V,0,et.z+St.so],[V,0,et.z+St.so+St.nl],[et.x+St.nd/2,0,et.z+St.so+St.nl],C)}break;case"rig.spindle.dia":if(St){gt.push(...be(Tt=>Tt==="spindle"));let V=et.z+St.so+St.nl+30,ut=-St.sd/2-12;Ut([et.x-St.sd/2,0,V],[et.x-St.sd/2,ut,V],[et.x+St.sd/2,ut,V],[et.x+St.sd/2,0,V],C)}break;case"rig.clear":if(St){gt.push(...be(jt=>jt==="nut"||jt==="spindle"));let V=Number(String(C).replace(/[^\d.]/g,""))||0,ut=W.rig&&W.rig.clear||2,Tt=(jt,we,Rn)=>{let ln=new de(new _n(jt,jt,Rn,40,1,!0),new rn({color:new Ot(Y.accent),wireframe:!0,transparent:!0,opacity:.45,depthTest:!1}));ln.rotation.x=Math.PI/2,ln.position.set(et.x,0,we+Rn/2),ln.renderOrder=29,Ce.add(ln)};Tt(St.nd/2+ut,et.z+St.so-ut,St.nl+ut),Tt(St.sd/2+ut,et.z+St.so+St.nl,90);let ie=et.z+St.so+St.nl/2;Ut(null,[et.x+St.nd/2,-St.nd/2-6,ie],[et.x+St.nd/2+ut,-St.nd/2-6,ie],null,C),qt++;break}case"rig.tc.change.x":case"rig.tc.change.y":case"rig.tc.setter.x":case"rig.tc.setter.y":case"rig.tc.route":case"rig.tc.zsafe":{let V=/change/.test(ze)?"change":/setter/.test(ze)?"setter":"route";wn.children.forEach(ut=>{(ut.userData.part===V||V==="route"&&ut.userData.part==="change")&&gt.push(ut)});break}case"rig.tc.zero.x":case"rig.tc.zero.y":{oi(Ce,[yt,0,0],3.5);let V=ai("rotary zero: X0 at the jaw face, Y0 Z0 on the axis");V.center.set(.5,0),V.position.set(yt,-ht-14,ht+8),Ce.add(V),Ut([yt,0,0],[yt,-ht-14,ht+8],[yt,-ht-14,ht+8],null,""),qt++;break}default:break}ea(gt);let kn=qt>0||gt.length>0;return kn&&y&&v(gt),zt(),kn}function v(y){let R=new Je;if(y.forEach(tt=>R.expandByObject(tt)),[Ce,Yn].forEach(tt=>{tt.children.length&&R.expandByObject(tt)}),R.isEmpty())return;s.updateMatrixWorld();let C=!0;for(let tt of[R.min.x,R.max.x])for(let it of[R.min.y,R.max.y])for(let It of[R.min.z,R.max.z]){let ht=new I(tt,it,It).project(s);(ht.z>1||Math.abs(ht.x)>1||Math.abs(ht.y)>1)&&(C=!1)}if(C)return;let k=s.position.clone().sub(r.target).normalize(),lt=R.getCenter(new I),N=R.getSize(new I).multiplyScalar(.9);R.expandByVector(N),q(R,k,lt)}function F(y){let R=new Je;if(!y&&Nt&&W){let C=Math.max(W.stockR,8)*1.15;return R.copy(Nt),R.expandByPoint(new I(W.chuckX-20,-C,-C)),R.expandByPoint(new I(Math.min(W.tailX,Nt.max.x+20),C,C)),R}if(W){let C=W.fixtures||[],k=Math.max(W.stockR*1.5+6,30,...C.map(tt=>tt.kind==="box"?Math.max(-tt.y0,tt.y1,tt.top):tt.r)),lt=Math.min(W.chuckX-75,...C.map(tt=>tt.x0)),N=Math.max(W.tailX+75,...C.map(tt=>tt.x1));R.expandByPoint(new I(lt,-k,-k)),R.expandByPoint(new I(N,k,k))}return Nt&&R.union(Nt),On&&On.change&&[On.change,On.setter].forEach(C=>{C&&R.expandByPoint(new I(C.x,C.y,0))}),R.isEmpty()&&R.set(new I(-50,-50,-50),new I(250,50,50)),R}function Q(y){let C=F(y==="whole"),k={front:[0,-1,.001],top:[0,-.001,1],end:[1,-.25,.25],iso:[.42,-1,.6],whole:[-.3,-1,.55]};q(C,new I(...k[y]||k.iso).normalize())}function q(y,R,C){let k=C||y.getCenter(new I),lt=new I().crossVectors(R,s.up).normalize(),N=new I().crossVectors(lt,R).normalize(),tt=[];for(let qt of[y.min.x,y.max.x])for(let Ut of[y.min.y,y.max.y])for(let ne of[y.min.z,y.max.z])tt.push(new I(qt,Ut,ne).sub(k));let it=0,It=0,ht=0;for(let qt of tt)it=Math.max(it,Math.abs(qt.dot(lt))),It=Math.max(It,Math.abs(qt.dot(N))),ht=Math.max(ht,Math.abs(qt.dot(R)));let yt=Math.tan(s.fov*xn/2),Gt=yt*s.aspect,gt=Math.max(It/yt,it/Gt)*1.12+ht;r.target.copy(k),s.position.copy(k).addScaledVector(R,gt),s.updateProjectionMatrix(),r.update(),zt()}function J(){return{p:s.position.toArray(),t:r.target.toArray()}}function Ct(y){!y||!y.p||!y.t||(s.position.fromArray(y.p),r.target.fromArray(y.t),r.update(),zt())}let Dt=null,Pt={stock:1,chuck_clearance:1,tailstock_clearance:1};function Vt(y){let R=null;for(let C=y;C;C=C.parent){if(!C.visible)return null;R||(C.userData.setting?R=C.userData.setting:C===P&&y.userData.part&&(R={flutes:b+".tool",shank:b+".stickout",nut:"rig.nut.dia",spindle:"rig.spindle.dia"}[y.userData.part]||null))}return R}function Xt(y){if(E||!t.onPickSetting)return null;let R=e.domElement.getBoundingClientRect(),C=new Ci;C.setFromCamera(new Ft((y.clientX-R.left)/R.width*2-1,-((y.clientY-R.top)/R.height)*2+1),s);let k=p?C.intersectObject(p,!1)[0]:null,lt=null;for(let N of C.intersectObjects([u,h,x,m,wn].concat(P?[P]:[]),!0)){if(!N.object.isMesh)continue;let tt=Vt(N.object);if(!tt)continue;if(Pt[tt]){lt||(lt=tt);continue}let it=N.object.material;if(!(it&&it.transparent&&it.opacity<.3))return k&&k.distance<N.distance?null:tt}return k?null:lt}let oe=0;function ue(y){if(!j.ghosts.length||E)return-1;let R=e.domElement.getBoundingClientRect(),C=new Ci;C.setFromCamera(new Ft((y.clientX-R.left)/R.width*2-1,-((y.clientY-R.top)/R.height)*2+1),s);let k=C.intersectObject(nt,!0).find(lt=>lt.object.userData.idxGhost);return k?k.object.userData.idx:-1}e.domElement.addEventListener("pointerdown",y=>{Dt=[y.clientX,y.clientY];let R=ue(y);R<0||(j.drag={i:R,moved:!1,a:j.list[R].a,startA:Tn(y)},r.enabled=!1,e.domElement.setPointerCapture(y.pointerId),y.stopPropagation())},!0),e.domElement.addEventListener("pointermove",y=>{let R=j.drag;if(!R){let tt=j.ghosts.length&&!E&&ue(y)>=0;j.ghosts.length&&!E&&y.buttons===0&&(e.domElement.style.cursor=tt?j.opts.editable?"grab":"pointer":""),y.buttons===0&&!tt&&t.onPickSetting&&performance.now()-oe>70&&(oe=performance.now(),e.domElement.style.cursor=Xt(y)?"pointer":"");return}if(!j.opts.editable||R.startA===null||!R.moved&&Math.hypot(y.clientX-Dt[0],y.clientY-Dt[1])<4)return;let C=Tn(y);if(C===null)return;R.moved=!0,e.domElement.style.cursor="grabbing";let k=y.shiftKey?1:5,lt=Math.round((j.list[R.i].a+((C-R.startA+540)%360-180))/k)*k;lt=(lt%360+360)%360,R.a=lt;let N=j.ghosts[R.i];if(N.pivot.rotation.x=-Rt(lt),N.pivot.remove(N.label),N.label.material.map.dispose(),N.label.material.dispose(),N.label=gs("A"+lt+"\xB0",qn.index,30),N.label.position.set(0,0,(j.opts.rTip||25)+(j.opts.tool.len||20)+58),N.label.scale.set(7*N.label.userData.aspect,7,1),N.pivot.add(N.label),j.opts.pick===R.i){let tt=Rt(lt),it=st.shadow.camera.right;st.position.set(st.target.position.x,Math.sin(tt)*it*3,Math.cos(tt)*it*3)}t.onIndexDrag&&t.onIndexDrag(R.i,lt,!1),zt()});let kt=y=>{let R=j.drag;if(!R)return!1;j.drag=null,r.enabled=!0,e.domElement.style.cursor="";try{e.domElement.releasePointerCapture(y.pointerId)}catch{}return R.moved?(j.list[R.i].a=R.a,t.onIndexDrag&&t.onIndexDrag(R.i,R.a,!0)):t.onIndexPick&&t.onIndexPick(R.i),Dt=null,!0};return e.domElement.addEventListener("pointercancel",kt),e.domElement.addEventListener("pointerup",y=>{if(kt(y)||!Dt||Math.hypot(y.clientX-Dt[0],y.clientY-Dt[1])>4)return;let R=Xt(y);if(R){t.onPickSetting(R);return}if(!p||!t.onPick)return;let C=e.domElement.getBoundingClientRect(),k=new Ft((y.clientX-C.left)/C.width*2-1,-((y.clientY-C.top)/C.height)*2+1),lt=new Ci;lt.setFromCamera(k,s);let N=lt.intersectObject(p,!1)[0];if(!N)return;let tt=f.worldToLocal(N.point.clone());t.onPick({x:tt.x,y:tt.y,z:tt.z})}),{setTheme(y){Y=Object.assign(Y,y),ve(),W&&A(W),vt(S),p&&(p.material=xt()),j.list.length&&Ht(),Object.keys(d).forEach(R=>{d[R].material=ct[R]||ct.finish}),zt()},setSetup(y){D=y.aSign||1,A(y),Mt(M)},setPart:rt,setPartBad:ft,setToolpath:Yt,setOp:wt,setA:Mt,view:Q,getCamera:J,setCamera:Ct,setTenons:vt,tenonCount(){return m.children.filter(y=>y.isMesh).length},simSet:Zt,simUpdate:Kt,simMode:dt,simToolAt:Et,simOverlay:re,simGhost:B,simPart:bt,setIndexAngles:Se,setLeftover:En,setToolChanges:Qr,highlight:fl,settingAt(y,R){return Xt({clientX:y,clientY:R})},screenOf(y){let R={chuck:Wt.chuck&&Wt.chuck[0],head:Wt.head&&Wt.head[0],tail:Wt.tail&&Wt.tail[0],centre:Wt.centre&&Wt.centre[0],nut:P&&P.children.find(lt=>lt.userData.part==="nut")}[y];if(!R)return null;s.updateMatrixWorld(),R.updateMatrixWorld(!0);let C=new Je().setFromObject(R).getCenter(new I).project(s),k=e.domElement.getBoundingClientRect();return{x:k.left+(C.x+1)/2*k.width,y:k.top+(1-C.y)/2*k.height}},highlighted(){return He.key?{key:He.key,parts:He.swapped.length,dims:Ce.children.length+Yn.children.length,onPart:Yn.children.length}:null},toolChangeShown(){return!!(On&&On.change&&wn.children.length)},toolChangeRoutes(){return On&&On.paths?On.paths.length:0},fixtures(){return(W&&W.fixtures||[]).map(y=>Object.assign({},y))},origin(){let y=Wt.origin&&Wt.origin[0];if(!y)return null;y.updateMatrixWorld(!0);let R=new I().setFromMatrixPosition(y.matrixWorld),C=!0;return y.traverse(k=>{k.material&&k.material.depthTest!==!1&&(C=!1)}),{x:R.x,y:R.y,z:R.z,onTop:C,label:y.children.some(k=>k.userData.origin)}},jaws(){return f.updateMatrixWorld(!0),x.children.map(y=>{let R=new I().setFromMatrixPosition(y.matrixWorld);return{x:R.x,y:R.y,z:R.z}})},headColor(){let y=Wt.head&&Wt.head[0];return y?"#"+y.material.color.getHexString():null},chuckColor(){let y=Wt.chuck&&Wt.chuck[0];return y?"#"+y.material.color.getHexString():null},colors(){let y=C=>C&&C.material?"#"+C.material.color.getHexString():null,R=C=>P?P.children.find(k=>k.userData.part===C):null;return{chuck:y(Wt.chuck&&Wt.chuck[0]),jaw:y(x.children[0]),head:y(Wt.head&&Wt.head[0]),tail:y(Wt.tail&&Wt.tail[0]),centre:y(Wt.centre&&Wt.centre[0]),spindle:y(R("spindle")),nut:y(R("nut"))}},stockSpan(){let y=Wt.stock&&Wt.stock[0];if(!y)return null;let R=new Je().setFromObject(y);return{x0:R.min.x,x1:R.max.x}},headShade(){let y=Wt.head&&Wt.head[0];if(!y)return null;e.render(n,s);let R=new Je().setFromObject(y),C=R.getCenter(new I),k=C.clone().project(s),lt=e.getContext(),N=lt.drawingBufferWidth,tt=lt.drawingBufferHeight,it=Math.round((k.x+1)/2*N),It=Math.round((k.y+1)/2*tt),ht=new Uint8Array(4);return lt.readPixels(it,It,1,1,lt.RGBA,lt.UNSIGNED_BYTE,ht),(.299*ht[0]+.587*ht[1]+.114*ht[2])/255},holderOpacity(){return zt(),Ae(),{tool:P?P.userData.opacity:null,sim:L?L.userData.opacity:null}},aArrow(){let y=Wt.aHead;return y?{y:y.position.y,dir:new I(0,1,0).applyQuaternion(y.quaternion).y}:null},endsOpacity(){return Ae(),ye?Object.assign({},ye.opacity):null},lookFrom(y,R){q(F(!!R),new I(...y).normalize())},toolHolder(){return P?{stickout:W&&W.stickout&&W.stickout[b],parts:P.children.length}:null},indexAngleCount(){return j.ghosts.length},indexReach(){return st.intensity>0},leftoverCount(){return $&&$.visible?$.count:0},indexScreen(y,R=.5,C=null){let k=j.ghosts[y];if(!k)return null;let lt=new I(0,0,C!==null?C:(j.opts.rTip||25)+(j.opts.tool&&j.opts.tool.len||20)*R);k.pivot.localToWorld(lt),lt.project(s);let N=e.domElement.getBoundingClientRect();return{x:N.left+(lt.x+1)/2*N.width,y:N.top+(1-lt.y)/2*N.height}},overlayCount(){return G&&G.visible?G.count:0},hasPart(){return!!p},snapshot(){return e.render(n,s),e.domElement.toDataURL("image/png")},dispose(){pt&&(pt=!1,cancelAnimationFrame(ot),O&&O.disconnect(),r.dispose(),ri(n),Object.values(ct).forEach(y=>y.dispose()),e.dispose(),e.forceContextLoss(),e.domElement.remove())}}}window.RotaryCamViewer={create:Vu,OP_COLORS:qn};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
