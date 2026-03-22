(()=>{var e={};e.id=626,e.ids=[626],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},55315:e=>{"use strict";e.exports=require("path")},17360:e=>{"use strict";e.exports=require("url")},14307:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>o.Z,__next_app__:()=>p,originalPathname:()=>c,pages:()=>d,routeModule:()=>u,tree:()=>l}),r(92396),r(53460),r(19718),r(31306),r(38048),r(58909);var s=r(93282),a=r(5736),o=r(61249),i=r(36880),n={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>i[e]);r.d(t,n);let l=["",{children:["login",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,92396)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\login\\page.tsx"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,53460)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\layout.tsx"],template:[()=>Promise.resolve().then(r.bind(r,19718)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\template.tsx"],error:[()=>Promise.resolve().then(r.bind(r,31306)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\error.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,38048)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,58909)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\not-found.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],d=["C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\login\\page.tsx"],c="/login/page",p={require:r,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/login/page",pathname:"/login",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},67619:(e,t,r)=>{Promise.resolve().then(r.bind(r,7274))},7274:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>p});var s=r(73227),a=r(23677),o=r(20649),i=r(41043),n=r(6642),l=r(78049),d=r(17160),c=r(4155);function p(){let[e,t]=(0,a.useState)(""),[r,p]=(0,a.useState)(""),[u,m]=(0,a.useState)(""),f=(0,i.useRouter)(),g="admin@estatex.ai",h="admin123",x=(0,l.t)(e=>e.setAuth),b=async(e,t)=>{m("");let r=await (0,n.a8)("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!r?.accessToken){m("Invalid response from server"),c.ZP.error("Login failed");return}let s=r.accessToken.trim();if(r.user)x(s,r.user);else{localStorage.setItem("token",s);try{let e=await (0,n.a8)("/auth/me");if(!e)throw Error("profile");x(s,e)}catch{localStorage.removeItem("token"),m("Signed in but could not load your profile. Try again."),c.ZP.error("Login incomplete");return}}c.ZP.success("Signed in"),f.push("/dashboard")},y=()=>`Cannot reach API at ${(0,n.ix)()}. Start the Nest API and ensure NEXT_PUBLIC_API_URL matches it, then run npm run seed:data if needed, or use Generate demo data on the Properties page.`;function v(e){if(e instanceof TypeError)return y();let t=e instanceof Error?e.message:String(e);try{let e=JSON.parse(t).message;if(Array.isArray(e))return e.join(", ");if("string"==typeof e)return e}catch{}return t&&t.length<220?t:"Invalid credentials"}let w=()=>"No admin user or wrong DB file. From the repo root run: npm run seed:data — then restart the API so it loads the same real-estate.db. Password: admin123",j=async t=>{t.preventDefault();try{await b(e,r)}catch(e){if(e instanceof TypeError)m(y()),c.ZP.error("Cannot reach API");else{let t=v(e);m("Invalid credentials"===t?`${t}. ${w()}`:t),c.ZP.error("Login failed")}}},P=async()=>{t(g),p(h),m("");try{await b(g,h)}catch(e){e instanceof TypeError?m(y()):m(`${v(e)}. ${w()}`)}};return s.jsx("div",{className:"min-h-screen bg-brand-bg flex items-center justify-center",children:(0,s.jsxs)("div",{className:"w-full max-w-md",children:[s.jsx("div",{className:"flex justify-center mb-8",children:s.jsx(d.T,{href:"/"})}),(0,s.jsxs)("form",{onSubmit:j,className:"rounded-xl border border-white/10 bg-brand-card/80 p-8 shadow-brand",children:[s.jsx("h1",{className:"text-xl font-semibold text-white",children:"Sign In"}),s.jsx("p",{className:"mt-2 text-slate-500",children:"Access your investment dashboard"}),u&&s.jsx("p",{className:"mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400",children:u}),(0,s.jsxs)("div",{className:"mt-6 space-y-4",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"Email"}),s.jsx("input",{type:"email",value:e,onChange:e=>t(e.target.value),required:!0,className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm text-slate-500",children:"Password"}),s.jsx("input",{type:"password",value:r,onChange:e=>p(e.target.value),required:!0,className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]})]}),s.jsx("button",{type:"submit",className:"mt-6 w-full btn-primary py-3",children:"Sign In"}),s.jsx("button",{type:"button",onClick:P,className:"mt-3 w-full rounded-lg border border-slate-600 bg-slate-800/80 py-3 font-medium text-slate-200 hover:bg-slate-800 transition",children:"Try demo (admin@estatex.ai)"}),(0,s.jsxs)("p",{className:"mt-4 text-center text-sm text-slate-500",children:["No account? ",s.jsx(o.default,{href:"/register",className:"text-cyan-400 hover:underline",children:"Register"})]})]})]})})}},92396:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(53189).createProxy)(String.raw`C:\Users\Admin\Documents\projects\real-estate\apps\web\src\app\login\page.tsx#default`)},4155:(e,t,r)=>{"use strict";r.d(t,{ZP:()=>R});var s,a=r(23677);let o={data:""},i=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let r="",s="",a="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+i+";":s+="f"==o[1]?c(i,o):o+"{"+c(i,"k"==o[1]?"":t)+"}":"object"==typeof i?s+=c(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(o,i):o+":"+i+";")}return r+(t&&a?t+"{"+a+"}":a)+s},p={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e},m=(e,t,r,s,a)=>{let o=u(e),i=p[o]||(p[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!p[i]){let t=o!==e?e:(e=>{let t,r,s=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?s.shift():t[3]?(r=t[3].replace(d," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(d," ").trim();return s[0]})(e);p[i]=c(a?{["@keyframes "+i]:t}:t,r?"":"."+i)}let m=r&&p.g?p.g:null;return r&&(p.g=p[i]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(p[i],t,s,m),i},f=(e,t,r)=>e.reduce((e,s,a)=>{let o=t[a];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==o?"":o)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return m(r.unshift?r.raw?f(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,i(t.target),t.g,t.o,t.k)}g.bind({g:1});let h,x,b,y=g.bind({k:1});function v(e,t){let r=this||{};return function(){let s=arguments;function a(o,i){let n=Object.assign({},o),l=n.className||a.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=g.apply(r,s)+(l?" "+l:""),t&&(n.ref=i);let d=e;return e[0]&&(d=n.as||e,delete n.as),b&&d[0]&&b(n),h(d,n)}return t?t(a):a}}var w=e=>"function"==typeof e,j=(e,t)=>w(e)?e(t):e,P=(()=>{let e=0;return()=>(++e).toString()})(),A=((()=>{let e;return()=>e})(),"default"),N=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return N(e,{type:e.toasts.find(e=>e.id===s.id)?1:0,toast:s});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},_=[],k={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},I=(e,t=A)=>{C[t]=N(C[t]||k,e),_.forEach(([e,r])=>{e===t&&r(C[t])})},S=e=>Object.keys(C).forEach(t=>I(e,t)),$=e=>Object.keys(C).find(t=>C[t].toasts.some(t=>t.id===e)),E=(e=A)=>t=>{I(t,e)},D={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},q=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||P()}),T=e=>(t,r)=>{let s=q(t,e,r);return E(s.toasterId||$(s.id))({type:2,toast:s}),s.id},O=(e,t)=>T("blank")(e,t);O.error=T("error"),O.success=T("success"),O.loading=T("loading"),O.custom=T("custom"),O.dismiss=(e,t)=>{let r={type:3,toastId:e};t?E(t)(r):S(r)},O.dismissAll=e=>O.dismiss(void 0,e),O.remove=(e,t)=>{let r={type:4,toastId:e};t?E(t)(r):S(r)},O.removeAll=e=>O.remove(void 0,e),O.promise=(e,t,r)=>{let s=O.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?j(t.success,e):void 0;return a?O.success(a,{id:s,...r,...null==r?void 0:r.success}):O.dismiss(s),e}).catch(e=>{let a=t.error?j(t.error,e):void 0;a?O.error(a,{id:s,...r,...null==r?void 0:r.error}):O.dismiss(s)}),e};var U=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,L=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Z=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,G=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${L} 0.15s ease-out forwards;
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
    animation: ${Z} 0.15s ease-out forwards;
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
`),z=(v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${G} 1s linear infinite;
`,y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),F=y`
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

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${F} 0.2s ease-out forwards;
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
`,s=a.createElement,c.p=void 0,h=s,x=void 0,b=void 0,g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var R=O}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[522,251,504],()=>r(14307));module.exports=s})();