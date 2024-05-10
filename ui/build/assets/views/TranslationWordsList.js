import{j as e,r,v as l,M as d,a as u,V as c}from"../index.js";import{p as h,m as x}from"../marked.esm.js";const f=n=>h.sanitize(x.parse(n)),p=({translationWord:n})=>{const{content:s,loading:a}=g(n);return s===null&&!a?null:a?e.jsx("div",{children:"Loading..."}):e.jsx("div",{dangerouslySetInnerHTML:{__html:s??""},className:"prose-lg"})},g=n=>{const[s,a]=r.useState(null),[o,i]=r.useState(!1);return r.useEffect(()=>{l.setMessageListeners(t=>{switch(t.data.type){case"update-tw-content":a(t.data.payload.content!==null?f(t.data.payload.content):null),i(!1);break}})},[]),r.useEffect(()=>{l.postMessage({type:d.GET_TW_CONTENT,payload:{translationWord:n}}),i(!0)},[n]),{content:s,loading:o}},m=()=>{const{translationWordsList:n,diskTwl:s}=j(),[a,o]=r.useState(0);r.useEffect(()=>{s.length>0&&o(0)},[s,s.length]);const i=r.useMemo(()=>{var t;return s!=null&&s[a]?{path:((t=s==null?void 0:s[a])==null?void 0:t.twUriPath)??null}:null},[a,s]);return n.length===0?e.jsx("div",{className:"prose-base",children:e.jsx("h1",{children:e.jsx("i",{children:"No Translation Words Found"})})}):s.length===0?e.jsx("div",{className:"prose-base",children:e.jsx("h3",{children:"Found translation Words but they do not have corresponding descriptions on disk."})}):e.jsxs("div",{className:"flex flex-col",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx(c,{onClick:()=>o(t=>t===0?t:t-1),appearance:"secondary","aria-label":"left",className:"",disabled:a===0,children:e.jsx("i",{className:"codicon codicon-chevron-left"})}),e.jsxs("span",{className:"w-fit",children:[a+1," / ",s.length]}),e.jsx(c,{onClick:()=>o(t=>t===s.length-1?t:t+1),appearance:"secondary","aria-label":"right",className:"",disabled:a===s.length-1,children:e.jsx("i",{className:"codicon codicon-chevron-right"})})]}),e.jsx("div",{id:"note-container",className:"col-span-6",children:e.jsx(p,{translationWord:i})})]})},j=()=>{const[n,s]=r.useState([]);return r.useEffect(()=>{l.setMessageListeners(o=>{switch(o.data.type){case"update-twl":s(o.data.payload.wordsList??[]);break}})},[]),{diskTwl:r.useMemo(()=>n.filter(o=>o.existsOnDisk),[n]),translationWordsList:n}};u(e.jsx(m,{}));
