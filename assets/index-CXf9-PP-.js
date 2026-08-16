(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const N="gfgTrackerData",x="gfgTrackerFilters";let u=[],D=[];const q=["Great","Good","Trivial","Hard","Review"];let o={reviewCount:{},tags:{},opened:{},notes:{},skipped:{},customQuestions:[],customTags:[]},c={tag:null,showNotes:!1,sort:"done",sortDir:"asc"},p=new Set,g=null,v={note:!0,tags:!0,category:!0};const f=document.getElementById("puzzles-container"),$=document.getElementById("currently-solving-container"),I=document.getElementById("heatmap"),j=document.getElementById("unsolved-count"),Q=document.getElementById("solved-count"),y=document.getElementById("tag-filter-dropdown"),U=document.getElementById("tag-filter-menu"),w=document.getElementById("sort-filter-dropdown");document.getElementById("sort-filter-menu");const E=document.getElementById("show-notes-filter"),O=document.getElementById("random-btn"),m=document.getElementById("random-question-container"),Y=document.getElementById("hamburger-btn"),z=document.getElementById("side-drawer"),h=document.getElementById("drawer-overlay"),G=document.getElementById("drawer-close"),L=document.getElementById("add-modal-overlay"),M=document.getElementById("add-modal"),J=document.getElementById("open-add-modal-btn"),_=document.getElementById("add-modal-close"),K=document.getElementById("save-custom-btn"),Z=document.getElementById("tag-manager-list"),S=document.getElementById("new-tag-input"),V=document.getElementById("add-tag-btn");function P(e=new Date){const n=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-n).toISOString().split("T")[0]}async function W(){ee(),(!o.customTags||o.customTags.length===0)&&(o.customTags=[...q]),await X(),oe(),te(),ne(),se(),ae(),re(),ie(),H(),A(),l(),document.addEventListener("click",e=>{g&&!e.target.closest(".tag-popover")&&!e.target.closest(".badge-add")&&(g=null,l())})}async function X(){try{const e=await fetch("./puzzles.json");if(!e.ok)throw new Error("Network response was not ok");const n=await e.json(),t=new Map,s=new Set;n.forEach(r=>{if(!t.has(r.url)){t.set(r.url,r);const i=r.category||"Uncategorized";s.has(i)||(s.add(i),D.push(i))}});let a=Array.from(t.values());o.customQuestions&&o.customQuestions.forEach(r=>{s.has(r.category)||(s.add(r.category),D.push(r.category)),a.push(r)}),u=a.map((r,i)=>({...r,sno:r.sno||i+1,category:r.category||"Uncategorized"}))}catch(e){console.error("Failed to fetch puzzles",e),f.innerHTML='<div style="color:var(--text-muted)">Failed to load data.</div>'}}function ee(){try{const e=localStorage.getItem(N);if(e){const t=JSON.parse(e);o.reviewCount=t.reviewCount||{},o.tags=t.tags||{},o.opened=t.opened||{},o.notes=t.notes||{},o.skipped=t.skipped||{},o.customQuestions=t.customQuestions||[],o.customTags=t.customTags||[]}const n=localStorage.getItem(x);if(n){const t=JSON.parse(n);t.tag!==void 0&&(c.tag=t.tag),typeof t.showNotes=="boolean"&&(c.showNotes=t.showNotes),t.sort&&(c.sort=t.sort),t.sortDir&&(c.sortDir=t.sortDir),E.checked=c.showNotes}}catch{}}function d(){localStorage.setItem(N,JSON.stringify(o)),H(),A()}function T(){localStorage.setItem(x,JSON.stringify(c))}window.incrementReview=function(e){o.reviewCount[e]||(o.reviewCount[e]={count:0,lastDone:null}),o.reviewCount[e].count+=1,o.reviewCount[e].lastDone=P(),o.opened[e]&&delete o.opened[e],d(),l()};window.toggleTag=function(e,n,t){t&&t.stopPropagation(),o.tags[e]||(o.tags[e]=[]);const s=o.tags[e].indexOf(n);s>-1?o.tags[e].splice(s,1):o.tags[e].push(n),d(),l()};window.openTagPopover=function(e,n){n.stopPropagation(),g=g===e?null:e,l()};window.toggleSkip=function(e){o.skipped[e]?delete o.skipped[e]:o.skipped[e]=Date.now(),d(),l()};window.toggleNoteRow=function(e){p.has(e)?p.delete(e):p.add(e),l()};window.markOpened=function(e){o.opened[e]=Date.now(),d(),l()};window.removeCurrentlySolving=function(e,n){n.stopPropagation(),n.preventDefault(),delete o.opened[e],d(),l()};function te(){const e=()=>{Z.innerHTML=o.customTags.map((n,t)=>`
      <div class="tag-list-item">
        <span>${n}</span>
        <button class="btn-icon" style="padding:0; color:var(--danger);" onclick="deleteCustomTag(${t})">✖</button>
      </div>
    `).join(""),F()};window.deleteCustomTag=function(n){confirm(`Delete tag "${o.customTags[n]}"?`)&&(o.customTags.splice(n,1),d(),e(),l())},V.addEventListener("click",()=>{const n=S.value.trim();n&&!o.customTags.includes(n)&&(o.customTags.push(n),d(),S.value="",e())}),e()}function ne(){const e=()=>{M.classList.add("open"),L.classList.add("open"),document.body.classList.add("no-scroll")},n=()=>{M.classList.remove("open"),L.classList.remove("open"),document.body.classList.remove("no-scroll")};J.addEventListener("click",e),_.addEventListener("click",n),L.addEventListener("click",n),K.addEventListener("click",()=>{const t=document.getElementById("custom-url").value.trim(),s=document.getElementById("custom-title").value.trim(),a=document.getElementById("custom-category").value.trim()||"Custom";if(!t||!s)return alert("URL and Title are required.");const r={url:t,title:s,category:a,sno:u.length+1};o.customQuestions.push(r),u.push(r),o.opened[t]=Date.now(),d(),n(),document.getElementById("custom-url").value="",document.getElementById("custom-title").value="",document.getElementById("custom-category").value="",l()})}function oe(){const e=()=>{z.classList.add("open"),h.classList.add("open"),document.body.classList.add("no-scroll")},n=()=>{z.classList.remove("open"),h.classList.remove("open"),document.body.classList.remove("no-scroll")};Y.addEventListener("click",e),G.addEventListener("click",n),h.addEventListener("click",n);const t=document.getElementById("reset-progress-btn");t&&t.addEventListener("click",()=>{confirm("Are you sure you want to completely reset all your progress? This cannot be undone.")&&(o.reviewCount={},o.tags={},o.opened={},o.notes={},o.skipped={},d(),l())});const s=document.getElementById("random-btn-toggle");s&&s.addEventListener("change",a=>{O.style.display=a.target.checked?"inline-flex":"none"})}function F(){U.innerHTML=`
    <div class="dropdown-item" onclick="setTagFilter(null)">All Tags</div>
    ${o.customTags.map(e=>`<div class="dropdown-item" onclick="setTagFilter('${e}')">${e}</div>`).join("")}
  `}function se(){const e=y.querySelector(".dropdown-btn"),n=()=>{e.innerHTML=c.tag?`Tag: ${c.tag} <span class="arrow">▼</span>`:'Filter by Tag <span class="arrow">▼</span>'};e.addEventListener("click",t=>{t.stopPropagation(),y.classList.toggle("open"),w.classList.remove("open")}),document.addEventListener("click",()=>{y.classList.remove("open")}),window.setTagFilter=function(t){c.tag=t,T(),n(),l()},E.addEventListener("change",()=>{c.showNotes=E.checked,T(),l()}),F(),n()}function ae(){const e=w.querySelector(".dropdown-btn"),n=()=>{let t="";c.sort==="done"&&(t="Done"),c.sort==="sno"&&(t="Sno"),c.sort==="title"&&(t="Title"),c.sort==="category"&&(t="Category");const s=c.sortDir==="asc"?"(Asc)":"(Desc)";e.innerHTML=`Sort By: ${t} ${s} <span class="arrow">▼</span>`};e.addEventListener("click",t=>{t.stopPropagation(),w.classList.toggle("open"),y.classList.remove("open")}),document.addEventListener("click",()=>{w.classList.remove("open")}),window.setSortFilter=function(t,s){c.sort=t,c.sortDir=s,T(),n(),l()},n()}function re(){document.querySelectorAll(".col-toggle").forEach(e=>{e.addEventListener("change",n=>{v[n.target.value]=n.target.checked,l()})})}function ie(){O.addEventListener("click",()=>{const n=R().filter(s=>!o.reviewCount[s.url]||o.reviewCount[s.url].count===0);if(n.length===0){m.innerHTML='<div style="padding:1rem; color:var(--text-muted)">You solved all visible questions!</div>';return}const t=n[Math.floor(Math.random()*n.length)];m.innerHTML=`
      <div class="list-header" style="display:flex; justify-content:space-between;">
        <span>🎲 Your Random Challenge</span>
        <button id="close-random-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✖</button>
      </div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${b(t,!1)}
      </div>
    `,m.querySelector("#close-random-btn").addEventListener("click",()=>{m.innerHTML=""})})}function H(){const e=Object.values(o.reviewCount).filter(t=>t.count>0).length,n=u.length-e;Q.textContent=e,j.textContent=n}function A(){I.innerHTML="";const e={};Object.values(o.reviewCount).forEach(a=>{a.count>0&&a.lastDone&&(e[a.lastDone]=(e[a.lastDone]||0)+1)});const n=document.createElement("div");n.className="heatmap-grid";const t=new Date,s=[];for(let a=13;a>=0;a--){const r=new Date(t);r.setDate(t.getDate()-a),s.push(P(r))}s.forEach(a=>{const r=e[a]||0,i=document.createElement("div");i.className="heatmap-cell",r>0&&(i.setAttribute("data-count",Math.min(r,5)),i.textContent=r),i.setAttribute("data-title",`${a}: ${r} reviews`),n.appendChild(i)}),I.appendChild(n)}function R(){return u.filter(e=>!(c.tag&&!(o.tags[e.url]||[]).includes(c.tag)))}function ce(e){const n=o.tags[e]||[];let t="";if(n.forEach(s=>{const a=`badge-${s.toLowerCase()}`;t+=`<span class="badge badge-tag ${a}" onclick="toggleTag('${e}', '${s}', event)">${s} ✖</span>`}),t+=`<span class="badge badge-add" onclick="openTagPopover('${e}', event)">+ Tag</span>`,g===e){const s=o.customTags.map(a=>`<label class="matte-checkbox" style="padding: 0.25rem;"><input type="checkbox" ${n.includes(a)?"checked":""} onchange="toggleTag('${e}','${a}', event)"><span class="checkmark" style="width:14px;height:14px;"></span> ${a}</label>`).join("");t+=`<div class="tag-popover" onclick="event.stopPropagation()">${s}</div>`}return t}function b(e,n=!1){const t=o.reviewCount[e.url]||{count:0},s=t.count>0,a=!!o.notes[e.url],r=p.has(e.url)||c.showNotes&&a;let i="";return n&&(i=`<button class="btn-icon" style="font-size:0.8rem; margin-left: 0.5rem; opacity: 0.5;" onclick="removeCurrentlySolving('${e.url}', event)" title="Remove from Currently Solving">✖</button>`),`
    <div class="puzzle-card ${s?"is-done":""}">
      <div class="col-actions">
        ${v.note?`
        <button class="btn-icon ${a?"active-note":""}" onclick="toggleNoteRow('${e.url}')" title="Notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        `:""}
        
        ${v.tags?`
        <div class="tags-container" style="position:relative; margin-left: 0.25rem;">
          ${ce(e.url)}
        </div>
        `:""}
      </div>

      <div class="col-done">
        <button class="btn-check ${s?"active":""}" onclick="incrementReview('${e.url}')" title="Mark Done">✓</button>
      </div>

      <div class="col-count">
        ${t.count}
      </div>
      
      <div class="col-main">
        <div>
          <a href="${e.url}" target="_blank" class="puzzle-link" onclick="markOpened('${e.url}')">${e.sno}. ${e.title}</a>${i}
        </div>
        <div class="puzzle-meta">
          ${v.category?`<span class="badge badge-cat">${e.category}</span>`:""}
          ${o.skipped[e.url]?'<span class="badge badge-review">Skipped</span>':""}
        </div>
      </div>
      
      <div class="col-skip">
        <button class="btn-icon" onclick="toggleSkip('${e.url}')" title="Toggle Skip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </button>
      </div>
      
      ${r?`
      <div class="note-container">
        <textarea class="note-input" placeholder="Write your notes here..." oninput="updateNote('${e.url}', this.value)">${o.notes[e.url]||""}</textarea>
      </div>
      `:""}
    </div>
  `}window.updateNote=function(e,n){const t=n.trim();t?o.notes[e]=t:delete o.notes[e],d()};function l(){f.innerHTML="",$.innerHTML="";const e=R();if(e.length===0){f.innerHTML='<div style="color:var(--text-muted); text-align:center; padding: 2rem;">No puzzles match your criteria.</div>';return}const n=[],t=[];e.forEach(s=>{o.opened[s.url]?n.push(s):t.push(s)}),n.sort((s,a)=>o.opened[a.url]-o.opened[s.url]),t.sort((s,a)=>{let r,i;if(c.sort==="done"){const k=C=>{const B=o.reviewCount[C];return B&&B.count>0?1:o.skipped[C]?.5:0};if(r=k(s.url),i=k(a.url),r===i)return s.sno-a.sno}else c.sort==="sno"?(r=s.sno,i=a.sno):c.sort==="title"?(r=s.title.toLowerCase(),i=a.title.toLowerCase()):c.sort==="category"&&(r=s.category.toLowerCase(),i=a.category.toLowerCase());return r<i?c.sortDir==="asc"?-1:1:r>i?c.sortDir==="asc"?1:-1:0}),n.length>0&&($.innerHTML=`
      <div class="list-header">CURRENTLY SOLVING</div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${n.map(s=>b(s,!0)).join("")}
      </div>
    `),f.innerHTML=`
    <div class="list-header">ALL PUZZLES</div>
    <div class="puzzle-list">
      ${t.map(s=>b(s,!1)).join("")}
    </div>
  `}document.addEventListener("DOMContentLoaded",W);
