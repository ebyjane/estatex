(()=>{var e={};e.id=179,e.ids=[179],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},55315:e=>{"use strict";e.exports=require("path")},17360:e=>{"use strict";e.exports=require("url")},18487:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>o.Z,__next_app__:()=>p,originalPathname:()=>d,pages:()=>c,routeModule:()=>m,tree:()=>n}),s(20369),s(62284),s(53460),s(19718),s(31306),s(38048),s(58909);var a=s(93282),r=s(5736),o=s(61249),i=s(36880),l={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>i[e]);s.d(t,l);let n=["",{children:["calculator",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,20369)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\calculator\\page.tsx"]}]},{error:[()=>Promise.resolve().then(s.bind(s,62284)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\calculator\\error.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(s.bind(s,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(s.bind(s,53460)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\layout.tsx"],template:[()=>Promise.resolve().then(s.bind(s,19718)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\template.tsx"],error:[()=>Promise.resolve().then(s.bind(s,31306)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\error.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,38048)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\loading.tsx"],"not-found":[()=>Promise.resolve().then(s.bind(s,58909)),"C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\not-found.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(s.bind(s,96495))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],c=["C:\\Users\\Admin\\Documents\\projects\\real-estate\\apps\\web\\src\\app\\calculator\\page.tsx"],d="/calculator/page",p={require:s,loadChunk:()=>Promise.resolve()},m=new a.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/calculator/page",pathname:"/calculator",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:n}})},7969:(e,t,s)=>{Promise.resolve().then(s.bind(s,51782))},74462:(e,t,s)=>{Promise.resolve().then(s.bind(s,9080))},51782:(e,t,s)=>{"use strict";s.d(t,{CalculatorView:()=>m});var a=s(73227),r=s(23677),o=s(72278),i=s(17160),l=s(4155),n=s(6642);async function c(e,t,s){let a=(t||"USD").toUpperCase(),r=(s||"USD").toUpperCase();if(!Number.isFinite(e)||a===r)return e;let o=`amount=${encodeURIComponent(String(e))}&from=${encodeURIComponent(a)}&to=${encodeURIComponent(r)}`,i=await fetch((0,n.JW)(`/fx/convert?${o}`));if(!i.ok)throw Error("FX convert failed");let l=await i.json();return"number"==typeof l.converted?l.converted:e}var d=s(9953);let p=(0,o.default)(async()=>{},{loadableGenerated:{modules:["app\\calculator\\CalculatorView.tsx -> ./CalculatorCharts"]},ssr:!1,loading:()=>a.jsx("div",{className:"mt-4 h-64 animate-pulse rounded-lg bg-white/5"})});function m(){let e=(0,d.u)(e=>e.currency),[t,s]=(0,r.useState)(2e5),[o,m]=(0,r.useState)(20),[u,x]=(0,r.useState)(8),[h,b]=(0,r.useState)(20),[g,f]=(0,r.useState)(1500),[y,v]=(0,r.useState)(null),j=async()=>{try{let s=await c(t,e,"USD"),a=await c(g,e,"USD"),r=await (0,n.a8)("/calculator/rent-vs-buy",{method:"POST",body:JSON.stringify({propertyPrice:s,downPaymentPct:o,interestRatePct:u,loanTermYears:h,monthlyRent:a})}),[i,d,p]=await Promise.all([c(r.rentCost5Y,"USD",e),c(r.buyCost5Y,"USD",e),c(r.emi,"USD",e)]);v({...r,rentCost5Y:i,buyCost5Y:d,emi:p}),l.ZP.success("Calculation complete")}catch(e){console.error(e),v(null),l.ZP.error("Could not calculate — check connection or try again")}},w=y?[{year:"Y1",rent:12*g,buy:12*y.emi},{year:"Y2",rent:24*g,buy:24*y.emi},{year:"Y3",rent:36*g,buy:36*y.emi},{year:"Y4",rent:48*g,buy:48*y.emi},{year:"Y5",rent:y.rentCost5Y,buy:y.buyCost5Y}]:[];return(0,a.jsxs)("div",{className:"min-h-screen bg-brand-bg text-slate-100",children:[a.jsx("header",{className:"border-b border-slate-800/50 bg-brand-bg/80 backdrop-blur-md",children:(0,a.jsxs)("div",{className:"mx-auto flex h-16 max-w-7xl items-center justify-between px-6",children:[a.jsx(i.T,{href:"/"}),(0,a.jsxs)("nav",{className:"flex gap-6",children:[a.jsx("a",{href:"/",className:"text-slate-400 hover:text-white",children:"Home"}),a.jsx("a",{href:"/properties",className:"text-slate-400 hover:text-white",children:"Properties"}),a.jsx("a",{href:"/dashboard",className:"text-slate-400 hover:text-white",children:"Dashboard"})]})]})}),(0,a.jsxs)("main",{className:"mx-auto max-w-7xl px-6 py-12",children:[a.jsx("h1",{className:"text-3xl font-bold text-white",children:"Rent vs Buy Calculator"}),(0,a.jsxs)("p",{className:"mt-2 text-slate-500",children:["Compare costs over 5 years — amounts use your display currency (",e,")"]}),(0,a.jsxs)("div",{className:"mt-8 grid gap-8 lg:grid-cols-2",children:[(0,a.jsxs)("div",{className:"rounded-xl border border-slate-700/50 bg-slate-900/50 p-6",children:[a.jsx("h2",{className:"font-semibold text-white",children:"Inputs"}),(0,a.jsxs)("div",{className:"mt-4 space-y-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{className:"block text-sm text-slate-500",children:["Property Price (",e,")"]}),a.jsx("input",{type:"number",value:t,onChange:e=>s(+e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,a.jsxs)("div",{children:[a.jsx("label",{className:"block text-sm text-slate-500",children:"Down Payment %"}),a.jsx("input",{type:"number",value:o,onChange:e=>m(+e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,a.jsxs)("div",{children:[a.jsx("label",{className:"block text-sm text-slate-500",children:"Interest Rate %"}),a.jsx("input",{type:"number",value:u,onChange:e=>x(+e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,a.jsxs)("div",{children:[a.jsx("label",{className:"block text-sm text-slate-500",children:"Loan Term (years)"}),a.jsx("input",{type:"number",value:h,onChange:e=>b(+e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{className:"block text-sm text-slate-500",children:["Monthly Rent (",e,")"]}),a.jsx("input",{type:"number",value:g,onChange:e=>f(+e.target.value),className:"mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"})]}),a.jsx("button",{type:"button",onClick:()=>void j(),className:"w-full rounded-lg bg-cyan-500 py-3 font-medium text-slate-950 transition hover:bg-cyan-400",children:"Calculate"})]})]}),a.jsx("div",{className:"space-y-6",children:y&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)("div",{className:"rounded-xl border border-slate-700/50 bg-slate-900/50 p-6",children:[a.jsx("h2",{className:"font-semibold text-white",children:"Result"}),(0,a.jsxs)("div",{className:"mt-4 grid grid-cols-2 gap-4",children:[(0,a.jsxs)("div",{children:[a.jsx("p",{className:"text-sm text-slate-500",children:"Rent Cost (5Y)"}),(0,a.jsxs)("p",{className:"text-lg font-medium text-white",children:[e," ",y.rentCost5Y.toLocaleString(void 0,{maximumFractionDigits:0})]})]}),(0,a.jsxs)("div",{children:[a.jsx("p",{className:"text-sm text-slate-500",children:"Buy Cost (5Y)"}),(0,a.jsxs)("p",{className:"text-lg font-medium text-white",children:[e," ",y.buyCost5Y.toLocaleString(void 0,{maximumFractionDigits:0})]})]}),(0,a.jsxs)("div",{children:[a.jsx("p",{className:"text-sm text-slate-500",children:"EMI"}),(0,a.jsxs)("p",{className:"text-lg font-medium text-cyan-400",children:[e," ",y.emi.toLocaleString(void 0,{maximumFractionDigits:0}),"/mo"]})]}),(0,a.jsxs)("div",{children:[a.jsx("p",{className:"text-sm text-slate-500",children:"Recommendation"}),a.jsx("p",{className:"text-lg font-medium capitalize text-green-400",children:y.recommendation})]})]})]}),w.length>0&&(0,a.jsxs)("div",{className:"rounded-xl border border-slate-700/50 bg-slate-900/50 p-6",children:[a.jsx("h2",{className:"font-semibold text-white",children:"5-Year Cost Comparison"}),a.jsx(p,{data:w,displayCurrency:e})]})]})})]})]})]})}},9080:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>o});var a=s(73227);s(23677);var r=s(20649);function o({error:e,reset:t}){return(0,a.jsxs)("div",{className:"mx-auto max-w-lg px-6 py-16 text-center",children:[a.jsx("h1",{className:"text-xl font-semibold text-white",children:"Calculator couldn't load"}),a.jsx("p",{className:"mt-3 text-sm text-slate-400",children:e.message}),(0,a.jsxs)("div",{className:"mt-6 flex flex-wrap justify-center gap-3",children:[a.jsx("button",{type:"button",onClick:()=>t(),className:"rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400",children:"Try again"}),a.jsx(r.default,{href:"/",className:"rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200",children:"Home"})]})]})}},62284:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>a});let a=(0,s(53189).createProxy)(String.raw`C:\Users\Admin\Documents\projects\real-estate\apps\web\src\app\calculator\error.tsx#default`)},20369:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>o});var a=s(99013);let r=(0,s(53189).createProxy)(String.raw`C:\Users\Admin\Documents\projects\real-estate\apps\web\src\app\calculator\CalculatorView.tsx#CalculatorView`);function o(){return a.jsx(r,{})}},4155:(e,t,s)=>{"use strict";s.d(t,{ZP:()=>M});var a,r=s(23677);let o={data:""},i=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,c=/\n+/g,d=(e,t)=>{let s="",a="",r="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?s=o+" "+i+";":a+="f"==o[1]?d(i,o):o+"{"+d(i,"k"==o[1]?"":t)+"}":"object"==typeof i?a+=d(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=d.p?d.p(o,i):o+":"+i+";")}return s+(t&&r?t+"{"+r+"}":r)+a},p={},m=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+m(e[s]);return t}return e},u=(e,t,s,a,r)=>{let o=m(e),i=p[o]||(p[o]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(o));if(!p[i]){let t=o!==e?e:(e=>{let t,s,a=[{}];for(;t=l.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(s=t[3].replace(c," ").trim(),a.unshift(a[0][s]=a[0][s]||{})):a[0][t[1]]=t[2].replace(c," ").trim();return a[0]})(e);p[i]=d(r?{["@keyframes "+i]:t}:t,s?"":"."+i)}let u=s&&p.g?p.g:null;return s&&(p.g=p[i]),((e,t,s,a)=>{a?t.data=t.data.replace(a,e):-1===t.data.indexOf(e)&&(t.data=s?e+t.data:t.data+e)})(p[i],t,a,u),i},x=(e,t,s)=>e.reduce((e,a,r)=>{let o=t[r];if(o&&o.call){let e=o(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"");function h(e){let t=this||{},s=e.call?e(t.p):e;return u(s.unshift?s.raw?x(s,[].slice.call(arguments,1),t.p):s.reduce((e,s)=>Object.assign(e,s&&s.call?s(t.p):s),{}):s,i(t.target),t.g,t.o,t.k)}h.bind({g:1});let b,g,f,y=h.bind({k:1});function v(e,t){let s=this||{};return function(){let a=arguments;function r(o,i){let l=Object.assign({},o),n=l.className||r.className;s.p=Object.assign({theme:g&&g()},l),s.o=/ *go\d+/.test(n),l.className=h.apply(s,a)+(n?" "+n:""),t&&(l.ref=i);let c=e;return e[0]&&(c=l.as||e,delete l.as),f&&c[0]&&f(l),b(c,l)}return t?t(r):r}}var j=e=>"function"==typeof e,w=(e,t)=>j(e)?e(t):e,C=(()=>{let e=0;return()=>(++e).toString()})(),N=((()=>{let e;return()=>e})(),"default"),P=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return P(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},k=[],D={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},S={},A=(e,t=N)=>{S[t]=P(S[t]||D,e),k.forEach(([e,s])=>{e===t&&s(S[t])})},U=e=>Object.keys(S).forEach(t=>A(e,t)),_=e=>Object.keys(S).find(t=>S[t].toasts.some(t=>t.id===e)),$=(e=N)=>t=>{A(t,e)},Y={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},I=(e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||C()}),R=e=>(t,s)=>{let a=I(t,e,s);return $(a.toasterId||_(a.id))({type:2,toast:a}),a.id},q=(e,t)=>R("blank")(e,t);q.error=R("error"),q.success=R("success"),q.loading=R("loading"),q.custom=R("custom"),q.dismiss=(e,t)=>{let s={type:3,toastId:e};t?$(t)(s):U(s)},q.dismissAll=e=>q.dismiss(void 0,e),q.remove=(e,t)=>{let s={type:4,toastId:e};t?$(t)(s):U(s)},q.removeAll=e=>q.remove(void 0,e),q.promise=(e,t,s)=>{let a=q.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?w(t.success,e):void 0;return r?q.success(r,{id:a,...s,...null==s?void 0:s.success}):q.dismiss(a),e}).catch(e=>{let r=t.error?w(t.error,e):void 0;r?q.error(r,{id:a,...s,...null==s?void 0:s.error}):q.dismiss(a)}),e};var E=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,F=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,O=y`
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

  animation: ${E} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${F} 0.15s ease-out forwards;
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
    animation: ${O} 0.15s ease-out forwards;
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
  animation: ${L} 1s linear infinite;
`,y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),G=y`
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
}`,T=(v("div")`
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
    animation: ${G} 0.2s ease-out forwards;
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
  animation: ${T} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
`,a=r.createElement,d.p=void 0,b=a,g=void 0,f=void 0,h`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var M=q}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[522,251,504],()=>s(18487));module.exports=a})();