(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const P="gfgTrackerData",O="gfgTrackerFilters";let u=[],I=[];const Q=["Great","Good","Trivial","Hard","Review"];let n={reviewCount:{},tags:{},opened:{},notes:{},skipped:{},customQuestions:[],customTags:[]},c={tag:null,showNotes:!1,sort:"done",sortDir:"asc"},p=new Set,g=null,v={note:!0,tags:!0,category:!0};const f=document.getElementById("puzzles-container"),z=document.getElementById("currently-solving-container"),M=document.getElementById("heatmap"),U=document.getElementById("unsolved-count"),Y=document.getElementById("solved-count"),w=document.getElementById("tag-filter-dropdown"),G=document.getElementById("tag-filter-menu"),y=document.getElementById("sort-filter-dropdown");document.getElementById("sort-filter-menu");const T=document.getElementById("show-notes-filter"),F=document.getElementById("random-btn"),m=document.getElementById("random-question-container"),J=document.getElementById("hamburger-btn"),S=document.getElementById("side-drawer"),h=document.getElementById("drawer-overlay"),V=document.getElementById("drawer-close"),L=document.getElementById("add-modal-overlay"),x=document.getElementById("add-modal"),_=document.getElementById("open-add-modal-btn"),K=document.getElementById("add-modal-close"),Z=document.getElementById("save-custom-btn"),W=document.getElementById("tag-manager-list"),N=document.getElementById("new-tag-input"),X=document.getElementById("add-tag-btn");function H(e=new Date){const o=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-o).toISOString().split("T")[0]}async function ee(){ne(),(!n.customTags||n.customTags.length===0)&&(n.customTags=[...Q]),await te(),ae(),oe(),se(),re(),ie(),ce(),le(),R(),j(),l(),document.addEventListener("click",e=>{g&&!e.target.closest(".tag-popover")&&!e.target.closest(".badge-add")&&(g=null,l())})}async function te(){try{const e=await fetch("./puzzles.json");if(!e.ok)throw new Error("Network response was not ok");const o=await e.json(),t=new Map,s=new Set;o.forEach(r=>{if(!t.has(r.url)){t.set(r.url,r);const i=r.category||"Uncategorized";s.has(i)||(s.add(i),I.push(i))}});let a=Array.from(t.values());n.customQuestions&&n.customQuestions.forEach(r=>{s.has(r.category)||(s.add(r.category),I.push(r.category)),a.push(r)}),u=a.map((r,i)=>({...r,sno:r.sno||i+1,category:r.category||"Uncategorized"}))}catch(e){console.error("Failed to fetch puzzles",e),f.innerHTML='<div style="color:var(--text-muted)">Failed to load data.</div>'}}function ne(){try{const e=localStorage.getItem(P);if(e){const t=JSON.parse(e);n.reviewCount=t.reviewCount||{},n.tags=t.tags||{},n.opened=t.opened||{},n.notes=t.notes||{},n.skipped=t.skipped||{},n.customQuestions=t.customQuestions||[],n.customTags=t.customTags||[]}const o=localStorage.getItem(O);if(o){const t=JSON.parse(o);t.tag!==void 0&&(c.tag=t.tag),typeof t.showNotes=="boolean"&&(c.showNotes=t.showNotes),t.sort&&(c.sort=t.sort),t.sortDir&&(c.sortDir=t.sortDir),T.checked=c.showNotes}}catch{}}function d(){localStorage.setItem(P,JSON.stringify(n)),R(),j()}function E(){localStorage.setItem(O,JSON.stringify(c))}let b,k=!1;window.startLongPress=function(e,o){k=!1,b=setTimeout(()=>{k=!0,decrementReview(e)},600)};window.cancelLongPress=function(){b&&clearTimeout(b)};window.handleClickPlus=function(e,o){k||incrementReview(e)};window.incrementReview=function(e){n.reviewCount[e]||(n.reviewCount[e]={count:0,lastDone:null}),n.reviewCount[e].count+=1,n.reviewCount[e].lastDone=H(),n.opened[e]&&delete n.opened[e],d(),l()};window.decrementReview=function(e){n.reviewCount[e]&&n.reviewCount[e].count>0&&(n.reviewCount[e].count-=1,d(),l())};window.toggleTag=function(e,o,t){t&&t.stopPropagation(),n.tags[e]||(n.tags[e]=[]);const s=n.tags[e].indexOf(o);s>-1?n.tags[e].splice(s,1):n.tags[e].push(o),d(),l()};window.openTagPopover=function(e,o){o.stopPropagation(),g=g===e?null:e,l()};window.toggleSkip=function(e){n.skipped[e]?delete n.skipped[e]:n.skipped[e]=Date.now(),d(),l()};window.toggleNoteRow=function(e){p.has(e)?p.delete(e):p.add(e),l()};window.markOpened=function(e){n.opened[e]=Date.now(),d(),l()};window.removeCurrentlySolving=function(e,o){o.stopPropagation(),o.preventDefault(),delete n.opened[e],d(),l()};function oe(){const e=()=>{W.innerHTML=n.customTags.map((o,t)=>`
      <div class="tag-list-item">
        <input type="text" class="matte-input" style="padding: 0.25rem 0.5rem; flex: 1; border: none; background: transparent;" value="${o}" onchange="editCustomTag(${t}, this.value)">
        <button class="btn-icon" style="padding:0; color:var(--danger);" onclick="deleteCustomTag(${t})">✖</button>
      </div>
    `).join(""),A()};window.editCustomTag=function(o,t){const s=t.trim();if(s&&s!==n.customTags[o]&&!n.customTags.includes(s)){const a=n.customTags[o];n.customTags[o]=s,Object.keys(n.tags).forEach(r=>{const i=n.tags[r].indexOf(a);i>-1&&(n.tags[r][i]=s)}),d(),e(),l()}else e()},window.deleteCustomTag=function(o){const t=n.customTags[o];confirm(`Delete tag "${t}"?`)&&(n.customTags.splice(o,1),Object.keys(n.tags).forEach(s=>{const a=n.tags[s].indexOf(t);a>-1&&n.tags[s].splice(a,1)}),d(),e(),l())},X.addEventListener("click",()=>{const o=N.value.trim();o&&!n.customTags.includes(o)&&(n.customTags.push(o),d(),N.value="",e())}),e()}function se(){const e=()=>{x.classList.add("open"),L.classList.add("open"),document.body.classList.add("no-scroll")},o=()=>{x.classList.remove("open"),L.classList.remove("open"),document.body.classList.remove("no-scroll")};_.addEventListener("click",e),K.addEventListener("click",o),L.addEventListener("click",o),Z.addEventListener("click",()=>{const t=document.getElementById("custom-url").value.trim(),s=document.getElementById("custom-title").value.trim(),a=document.getElementById("custom-category").value.trim()||"Custom";if(!t||!s)return alert("URL and Title are required.");const r={url:t,title:s,category:a,sno:u.length+1};n.customQuestions.push(r),u.push(r),n.opened[t]=Date.now(),d(),o(),document.getElementById("custom-url").value="",document.getElementById("custom-title").value="",document.getElementById("custom-category").value="",l()})}function ae(){const e=()=>{S.classList.add("open"),h.classList.add("open"),document.body.classList.add("no-scroll")},o=()=>{S.classList.remove("open"),h.classList.remove("open"),document.body.classList.remove("no-scroll")};J.addEventListener("click",e),V.addEventListener("click",o),h.addEventListener("click",o);const t=document.getElementById("reset-progress-btn");t&&t.addEventListener("click",()=>{confirm("Are you sure you want to completely reset all your progress? This cannot be undone.")&&(n.reviewCount={},n.tags={},n.opened={},n.notes={},n.skipped={},d(),l())});const s=document.getElementById("random-btn-toggle");s&&s.addEventListener("change",a=>{F.style.display=a.target.checked?"inline-flex":"none"})}function A(){G.innerHTML=`
    <div class="dropdown-item" onclick="setTagFilter(null)">All Tags</div>
    ${n.customTags.map(e=>`<div class="dropdown-item" onclick="setTagFilter('${e}')">${e}</div>`).join("")}
  `}function re(){const e=w.querySelector(".dropdown-btn"),o=()=>{e.innerHTML=c.tag?`Tag: ${c.tag} <span class="arrow">▼</span>`:'Filter by Tag <span class="arrow">▼</span>'};e.addEventListener("click",t=>{t.stopPropagation(),w.classList.toggle("open"),y.classList.remove("open")}),document.addEventListener("click",()=>{w.classList.remove("open")}),window.setTagFilter=function(t){c.tag=t,E(),o(),l()},T.addEventListener("change",()=>{c.showNotes=T.checked,E(),l()}),A(),o()}function ie(){const e=y.querySelector(".dropdown-btn"),o=()=>{let t="";c.sort==="done"&&(t="Done"),c.sort==="sno"&&(t="Sno"),c.sort==="title"&&(t="Title"),c.sort==="category"&&(t="Category");const s=c.sortDir==="asc"?"(Asc)":"(Desc)";e.innerHTML=`Sort By: ${t} ${s} <span class="arrow">▼</span>`};e.addEventListener("click",t=>{t.stopPropagation(),y.classList.toggle("open"),w.classList.remove("open")}),document.addEventListener("click",()=>{y.classList.remove("open")}),window.setSortFilter=function(t,s){c.sort=t,c.sortDir=s,E(),o(),l()},o()}function ce(){document.querySelectorAll(".col-toggle").forEach(e=>{e.addEventListener("change",o=>{v[o.target.value]=o.target.checked,l()})})}function le(){F.addEventListener("click",()=>{const o=q().filter(s=>!n.reviewCount[s.url]||n.reviewCount[s.url].count===0);if(o.length===0){m.innerHTML='<div style="padding:1rem; color:var(--text-muted)">You solved all visible questions!</div>';return}const t=o[Math.floor(Math.random()*o.length)];m.innerHTML=`
      <div class="list-header" style="display:flex; justify-content:space-between;">
        <span>🎲 Your Random Challenge</span>
        <button id="close-random-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✖</button>
      </div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${C(t,!1)}
      </div>
    `,m.querySelector("#close-random-btn").addEventListener("click",()=>{m.innerHTML=""})})}function R(){const e=Object.values(n.reviewCount).filter(t=>t.count>0).length,o=u.length-e;Y.textContent=e,U.textContent=o}function j(){M.innerHTML="";const e={};Object.values(n.reviewCount).forEach(a=>{a.count>0&&a.lastDone&&(e[a.lastDone]=(e[a.lastDone]||0)+1)});const o=document.createElement("div");o.className="heatmap-grid";const t=new Date,s=[];for(let a=13;a>=0;a--){const r=new Date(t);r.setDate(t.getDate()-a),s.push(H(r))}s.forEach(a=>{const r=e[a]||0,i=document.createElement("div");i.className="heatmap-cell",r>0&&(i.setAttribute("data-count",Math.min(r,5)),i.textContent=r),i.setAttribute("data-title",`${a}: ${r} reviews`),o.appendChild(i)}),M.appendChild(o)}function q(){return u.filter(e=>!(c.tag&&!(n.tags[e.url]||[]).includes(c.tag)))}function de(e){const o=n.tags[e]||[];let t="";if(o.forEach(s=>{const a=`badge-${s.toLowerCase()}`;t+=`<span class="badge badge-tag ${a}" onclick="toggleTag('${e}', '${s}', event)">${s} ✖</span>`}),t+=`<span class="badge badge-add" onclick="openTagPopover('${e}', event)">+ Tag</span>`,g===e){const s=n.customTags.map(a=>`<label class="matte-checkbox" style="padding: 0.25rem;"><input type="checkbox" ${o.includes(a)?"checked":""} onchange="toggleTag('${e}','${a}', event)"><span class="checkmark" style="width:14px;height:14px;"></span> ${a}</label>`).join("");t+=`<div class="tag-popover" onclick="event.stopPropagation()">${s}</div>`}return t}function C(e,o=!1){const t=n.reviewCount[e.url]||{count:0},s=t.count>0,a=!!n.notes[e.url],r=p.has(e.url)||c.showNotes&&a;let i="";return o&&(i=`<button class="btn-icon" style="font-size:0.8rem; margin-left: 0.5rem; opacity: 0.5;" onclick="removeCurrentlySolving('${e.url}', event)" title="Remove from Currently Solving">✖</button>`),`
    <div class="puzzle-card ${s?"is-done":""}">
      <div class="col-actions">
        ${v.note?`
        <button class="btn-icon action-note ${a?"active-note":""}" onclick="toggleNoteRow('${e.url}')" title="Notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        `:""}
        
        ${v.tags?`
        <div class="tags-container action-tags" style="position:relative;">
          ${de(e.url)}
        </div>
        `:""}

        <button 
          class="btn-check action-check ${s?"active":""}" 
          onpointerdown="startLongPress('${e.url}', event)" 
          onpointerup="cancelLongPress(); handleClickPlus('${e.url}', event)" 
          onpointerleave="cancelLongPress()" 
          title="Increment (Long press to decrement)">+</button>

        <div class="col-count action-count">
          ${t.count}
        </div>
      </div>

      <div class="col-main">
        <div>
          <a href="${e.url}" target="_blank" class="puzzle-link" onclick="markOpened('${e.url}')">${e.sno}. ${e.title}</a>${i}
        </div>
        <div class="puzzle-meta">
          ${v.category?`<span class="badge badge-cat">${e.category}</span>`:""}
          ${n.skipped[e.url]?'<span class="badge badge-review">Skipped</span>':""}
        </div>
      </div>
      
      <div class="col-skip">
        <button class="btn-icon" onclick="toggleSkip('${e.url}')" title="Toggle Skip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </button>
      </div>
      
      ${r?`
      <div class="note-container">
        <textarea class="note-input" placeholder="Write your notes here..." oninput="updateNote('${e.url}', this.value)">${n.notes[e.url]||""}</textarea>
      </div>
      `:""}
    </div>
  `}window.updateNote=function(e,o){const t=o.trim();t?n.notes[e]=t:delete n.notes[e],d()};function l(){f.innerHTML="",z.innerHTML="";const e=q();if(e.length===0){f.innerHTML='<div style="color:var(--text-muted); text-align:center; padding: 2rem;">No puzzles match your criteria.</div>';return}const o=[],t=[];e.forEach(s=>{n.opened[s.url]?o.push(s):t.push(s)}),o.sort((s,a)=>n.opened[a.url]-n.opened[s.url]),t.sort((s,a)=>{let r,i;if(c.sort==="done"){const $=B=>{const D=n.reviewCount[B];return D&&D.count>0?1:n.skipped[B]?.5:0};if(r=$(s.url),i=$(a.url),r===i)return s.sno-a.sno}else c.sort==="sno"?(r=s.sno,i=a.sno):c.sort==="title"?(r=s.title.toLowerCase(),i=a.title.toLowerCase()):c.sort==="category"&&(r=s.category.toLowerCase(),i=a.category.toLowerCase());return r<i?c.sortDir==="asc"?-1:1:r>i?c.sortDir==="asc"?1:-1:0}),o.length>0&&(z.innerHTML=`
      <div class="list-header">CURRENTLY SOLVING</div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${o.map(s=>C(s,!0)).join("")}
      </div>
    `),f.innerHTML=`
    <div class="list-header">ALL PUZZLES</div>
    <div class="puzzle-list">
      ${t.map(s=>C(s,!1)).join("")}
    </div>
  `}document.addEventListener("DOMContentLoaded",ee);
