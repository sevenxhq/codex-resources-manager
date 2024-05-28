import{a as e,v as r,M as i,r as p,j as n,V as m}from"../index.js";const u=()=>{const[t,o]=e.useState([]);return e.useEffect(()=>{r.setMessageListeners(s=>{switch(s.data.type){case i.SYNC_DOWNLOADED_RESOURCES:o(s.data.payload.downloadedResources);break}}),r.postMessage({type:i.SYNC_DOWNLOADED_RESOURCES,payload:{}})},[]),{downloadedResources:t}},j=[{label:"Translation Notes",key:"tn",url_component:"TSV Translation Notes"},{label:"Translation Words",key:"tw",url_component:"Translation Words"},{label:"Translation Words Lists",key:"twl",url_component:"TSV Translation Words Links"},{label:"Translation Questions",key:"tq",url_component:"Translation Questions&subject=tsv Translation Questions"},{label:"OBS Translation Notes",key:"obs-tn",url_component:"OBS Translation Notes&subject=tsv obs Translation notes"},{label:"OBS Translation Questions",key:"obs-tq",url_component:"OBS Translation Questions&subject=tsv obs Translation Questions"},{label:"OBS Translation Words Lists",key:"obs-twl",url_component:"TSV OBS Translation Words Links"},{label:"Translation Academy",key:"ta",url_component:"Translation Academy&subject=tsv Translation Academy"}],y=[{org:"unfoldingWord",icon:"https://images.prismic.io/unfolding-word/158ab69d-80e2-4bbe-831a-029cab21bc6f_uW-app-256.png?auto=compress,format&width=256"},{org:"Door43-Catalog",icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcVYa-G1vmVniiv3jrjiSKc9yVyxs8XwgXMlX7VQiv_HhwbWjZ"},{org:"WycliffeAssociates",icon:"https://content.bibletranslationtools.org/img/favicon.png"}],T=[{label:"OBS",key:"obs"},{label:"Bible",key:"bible"},...j],d=t=>{var s;return((s=y.find(l=>l.org===t))==null?void 0:s.icon)||""},g=()=>{const{downloadedResources:t}=u();return n.jsxs("table",{className:"table-auto w-full",children:[n.jsx("thead",{className:"font-semibold",children:n.jsxs("tr",{children:[n.jsx("td",{children:"Resource"}),n.jsx("td",{children:"Type"}),n.jsx("td",{children:"Organization"}),n.jsx("td",{children:"Version"}),n.jsx("td",{})]})}),n.jsx("tbody",{className:"gap-3",children:t==null?void 0:t.map(o=>n.jsx(h,{resource:o}))})]})},h=({resource:t})=>{var c;const o=a=>{r.postMessage({type:i.OPEN_RESOURCE,payload:{resource:{...a,isChecked:!0}}})},[s,l]=e.useState(null);return e.useEffect(()=>{fetch(t.remoteUrl).then(async a=>{const b=await a.json();l(b)})},[t.remoteUrl]),n.jsxs("tr",{children:[n.jsx("td",{children:t.name}),n.jsx("td",{children:(c=T.find(a=>a.key===t.type))==null?void 0:c.label}),n.jsx("td",{children:d(s==null?void 0:s.owner)!==""?n.jsx("img",{src:d(s==null?void 0:s.owner),alt:s==null?void 0:s.owner,className:"w-8 h-8 rounded-lg object-contain"}):s==null?void 0:s.owner}),n.jsx("td",{title:`Released on : ${new Date(s==null?void 0:s.released).toLocaleDateString()}`,children:t.version}),n.jsx("td",{className:"flex items-center justify-center px-2",children:n.jsx(m,{title:"Open Resource",appearance:"primary",className:"w-full",onClick:()=>o(t),children:n.jsx("i",{className:"codicon codicon-eye"})})})]})};p(n.jsx(g,{}));
