(()=>{var e={};e.id=11,e.ids=[11],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},55315:e=>{"use strict";e.exports=require("path")},17360:e=>{"use strict";e.exports=require("url")},68962:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.Z,__next_app__:()=>p,originalPathname:()=>c,pages:()=>d,routeModule:()=>u,tree:()=>l}),r(56870),r(53460),r(19718),r(31306),r(38048),r(58909);var s=r(93282),a=r(5736),i=r(61249),o=r(36880),n={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>o[e]);r.d(t,n);let l=["",{children:["register",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,56870)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\register\\page.tsx"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,53460)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\layout.tsx"],template:[()=>Promise.resolve().then(r.bind(r,19718)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\template.tsx"],error:[()=>Promise.resolve().then(r.bind(r,31306)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\error.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,38048)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,58909)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\not-found.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],d=["C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\register\\page.tsx"],c="/register/page",p={require:r,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/register/page",pathname:"/register",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},51420:(e,t,r)=>{Promise.resolve().then(r.bind(r,52254))},52254:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var s=r(73227),a=r(23677),i=r(20649),o=r(41043),n=r(6642),l=r(78049),d=r(9953),c=r(4155),p=r(17160);function u(){let e=(0,l.t)(e=>e.setAuth),t=(0,d.u)(e=>e.currency),[r,u]=(0,a.useState)(""),[m,x]=(0,a.useState)(""),[g,f]=(0,a.useState)(""),[b,h]=(0,a.useState)(""),[y,v]=(0,a.useState)(""),w=(0,o.useRouter)(),j=async s=>{s.preventDefault(),v("");try{let s=await (0,n.a8)("/auth/register",{method:"POST",body:JSON.stringify({email:r,password:m,firstName:g||void 0,lastName:b||void 0,investorType:"nri",preferredCurrency:t})});s.accessToken&&s.user&&(e(s.accessToken,s.user),c.ZP.success("Account created — welcome!"),w.push("/dashboard"))}catch(e){v("Registration failed. Email may already exist."),c.ZP.error("Registration failed")}};return s.jsx("div",{className:"min-h-screen bg-brand-bg flex items-center justify-center",children:(0,s.jsxs)("div",{className:"w-full max-w-md",children:[s.jsx("div",{className:"flex justify-center mb-8",children:s.jsx(p.T,{href:"/"})}),(0,s.jsxs)("form",{onSubmit:j,className:"rounded-xl border border-white/10 bg-brand-card/80 p-8 shadow-brand",children:[s.jsx("h1",{className:"text-xl font-semibold text-white",children:"Create Account"}),s.jsx("p",{className:"mt-2 text-slate-500",children:"Start investing globally"}),y&&s.jsx("p",{className:"mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400",children:y}),(0,s.jsxs)("div",{className:"mt-6 space-y-4",children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"First Name"}),s.jsx("input",{type:"text",value:g,onChange:e=>f(e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"Last Name"}),s.jsx("input",{type:"text",value:b,onChange:e=>h(e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"Email"}),s.jsx("input",{type:"email",value:r,onChange:e=>u(e.target.value),required:!0,className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"Password"}),s.jsx("input",{type:"password",value:m,onChange:e=>x(e.target.value),required:!0,minLength:6,className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]})]}),s.jsx("button",{type:"submit",className:"mt-6 w-full btn-primary py-3",children:"Create Account"}),(0,s.jsxs)("p",{className:"mt-4 text-center text-sm text-slate-500",children:["Already have an account? ",s.jsx(i.default,{href:"/login",className:"text-cyan-400 hover:underline",children:"Sign In"})]})]})]})})}},56870:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(53189).createProxy)(String.raw`C:\Users\Admin\Documents\projects\real-estate\apps\web\src\app\register\page.tsx#default`)},4155:(e,t,r)=>{"use strict";r.d(t,{ZP:()=>R});var s,a=r(23677);let i={data:""},o=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let r="",s="",a="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":s+="f"==i[1]?c(o,i):i+"{"+c(o,"k"==i[1]?"":t)+"}":"object"==typeof o?s+=c(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(i,o):i+":"+o+";")}return r+(t&&a?t+"{"+a+"}":a)+s},p={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e},m=(e,t,r,s,a)=>{let i=u(e),o=p[i]||(p[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!p[o]){let t=i!==e?e:(e=>{let t,r,s=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?s.shift():t[3]?(r=t[3].replace(d," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(d," ").trim();return s[0]})(e);p[o]=c(a?{["@keyframes "+o]:t}:t,r?"":"."+o)}let m=r&&p.g?p.g:null;return r&&(p.g=p[o]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(p[o],t,s,m),o},x=(e,t,r)=>e.reduce((e,s,a)=>{let i=t[a];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==i?"":i)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return m(r.unshift?r.raw?x(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,o(t.target),t.g,t.o,t.k)}g.bind({g:1});let f,b,h,y=g.bind({k:1});function v(e,t){let r=this||{};return function(){let s=arguments;function a(i,o){let n=Object.assign({},i),l=n.className||a.className;r.p=Object.assign({theme:b&&b()},n),r.o=/ *go\d+/.test(l),n.className=g.apply(r,s)+(l?" "+l:""),t&&(n.ref=o);let d=e;return e[0]&&(d=n.as||e,delete n.as),h&&d[0]&&h(n),f(d,n)}return t?t(a):a}}var w=e=>"function"==typeof e,j=(e,t)=>w(e)?e(t):e,N=(()=>{let e=0;return()=>(++e).toString()})(),A=((()=>{let e;return()=>e})(),"default"),P=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return P(e,{type:e.toasts.find(e=>e.id===s.id)?1:0,toast:s});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},k=[],_={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},S=(e,t=A)=>{C[t]=P(C[t]||_,e),k.forEach(([e,r])=>{e===t&&r(C[t])})},$=e=>Object.keys(C).forEach(t=>S(e,t)),D=e=>Object.keys(C).find(t=>C[t].toasts.some(t=>t.id===e)),q=(e=A)=>t=>{S(t,e)},E={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},O=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||N()}),U=e=>(t,r)=>{let s=O(t,e,r);return q(s.toasterId||D(s.id))({type:2,toast:s}),s.id},I=(e,t)=>U("blank")(e,t);I.error=U("error"),I.success=U("success"),I.loading=U("loading"),I.custom=U("custom"),I.dismiss=(e,t)=>{let r={type:3,toastId:e};t?q(t)(r):$(r)},I.dismissAll=e=>I.dismiss(void 0,e),I.remove=(e,t)=>{let r={type:4,toastId:e};t?q(t)(r):$(r)},I.removeAll=e=>I.remove(void 0,e),I.promise=(e,t,r)=>{let s=I.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?j(t.success,e):void 0;return a?I.success(a,{id:s,...r,...null==r?void 0:r.success}):I.dismiss(s),e}).catch(e=>{let a=t.error?j(t.error,e):void 0;a?I.error(a,{id:s,...r,...null==r?void 0:r.error}):I.dismiss(s)}),e};var T=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,z=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,G=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,L=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${T} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${G} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),F=(v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${L} 1s linear infinite;
`,y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),Z=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,M=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${F} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Z} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,v("div")`
  position: absolute;
`,v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${M} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,v("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,s=a.createElement,c.p=void 0,f=s,b=void 0,h=void 0,g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var R=I}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[522,251,504],()=>r(68962));module.exports=s})();