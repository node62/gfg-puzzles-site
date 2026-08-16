(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))t(a);new MutationObserver(a=>{for(const c of a)if(c.type==="childList")for(const i of c.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function o(a){const c={};return a.integrity&&(c.integrity=a.integrity),a.referrerPolicy&&(c.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?c.credentials="include":a.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function t(a){if(a.ep)return;a.ep=!0;const c=o(a);fetch(a.href,c)}})();const I="gfgTrackerData",D="gfgTrackerFilters";let u=[],k=[],s={reviewCount:{},tags:{},opened:{},notes:{},skipped:{},customQuestions:[]},l={tag:null,showNotes:!1},p=new Set,g=null,v={note:!0,tags:!0,category:!0};const M=["Great","Good","Trivial","Hard","Review"],f=document.getElementById("puzzles-container"),T=document.getElementById("currently-solving-container"),C=document.getElementById("heatmap"),P=document.getElementById("unsolved-count"),F=document.getElementById("solved-count"),y=document.getElementById("tag-filter-dropdown"),H=document.getElementById("tag-filter-menu"),E=document.getElementById("show-notes-filter"),S=document.getElementById("random-btn"),m=document.getElementById("random-question-container"),A=document.getElementById("hamburger-btn"),$=document.getElementById("side-drawer"),h=document.getElementById("drawer-overlay"),R=document.getElementById("drawer-close"),w=document.getElementById("add-modal-overlay"),z=document.getElementById("add-modal"),j=document.getElementById("open-add-modal-btn"),q=document.getElementById("add-modal-close"),Q=document.getElementById("save-custom-btn");function b(e=new Date){const n=e.getTimezoneOffset()*6e4;return new Date(e.getTime()-n).toISOString().split("T")[0]}async function U(){Y(),await G(),_(),J(),K(),Z(),V(),N(),x(),r(),document.addEventListener("click",e=>{g&&!e.target.closest(".tag-popover")&&!e.target.closest(".badge-add")&&(g=null,r())})}async function G(){try{const e=await fetch("./puzzles.json");if(!e.ok)throw new Error("Network response was not ok");const n=await e.json(),o=new Map,t=new Set;n.forEach(c=>{if(!o.has(c.url)){o.set(c.url,c);const i=c.category||"Uncategorized";t.has(i)||(t.add(i),k.push(i))}});let a=Array.from(o.values());s.customQuestions&&s.customQuestions.forEach(c=>{t.has(c.category)||(t.add(c.category),k.push(c.category)),a.push(c)}),u=a.map((c,i)=>({...c,sno:c.sno||i+1,category:c.category||"Uncategorized"}))}catch(e){console.error("Failed to fetch puzzles",e),f.innerHTML='<div style="color:var(--text-muted)">Failed to load data.</div>'}}function Y(){try{const e=localStorage.getItem(I);if(e){const o=JSON.parse(e);s.reviewCount=o.reviewCount||{},o.completed&&Object.keys(o.completed).forEach(t=>{s.reviewCount[t]||(s.reviewCount[t]={count:1,lastDone:o.completed[t]})}),s.tags=o.tags||{},o.starred&&o.starred.forEach(t=>{s.tags[t]||(s.tags[t]=["Great"])}),s.opened=o.opened||{},s.notes=o.notes||{},s.skipped=o.skipped||{},s.customQuestions=o.customQuestions||[]}const n=localStorage.getItem(D);if(n){const o=JSON.parse(n);o.tag!==void 0&&(l.tag=o.tag),typeof o.showNotes=="boolean"&&(l.showNotes=o.showNotes),E.checked=l.showNotes}}catch{}}function d(){localStorage.setItem(I,JSON.stringify(s)),N(),x()}function B(){localStorage.setItem(D,JSON.stringify(l))}window.incrementReview=function(e){s.reviewCount[e]||(s.reviewCount[e]={count:0,lastDone:b()}),s.reviewCount[e].count+=1,s.reviewCount[e].lastDone=b(),d(),r()};window.toggleTag=function(e,n,o){o&&o.stopPropagation(),s.tags[e]||(s.tags[e]=[]);const t=s.tags[e].indexOf(n);t>-1?s.tags[e].splice(t,1):s.tags[e].push(n),d(),r()};window.openTagPopover=function(e,n){n.stopPropagation(),g=g===e?null:e,r()};window.toggleSkip=function(e){s.skipped[e]?delete s.skipped[e]:s.skipped[e]=Date.now(),d(),r()};window.toggleNoteRow=function(e){p.has(e)?p.delete(e):p.add(e),r()};window.markOpened=function(e){s.opened[e]=Date.now(),d(),r()};window.removeCurrentlySolving=function(e,n){n.stopPropagation(),n.preventDefault(),delete s.opened[e],d(),r()};function J(){const e=()=>{z.classList.add("open"),w.classList.add("open"),document.body.classList.add("no-scroll")},n=()=>{z.classList.remove("open"),w.classList.remove("open"),document.body.classList.remove("no-scroll")};j.addEventListener("click",e),q.addEventListener("click",n),w.addEventListener("click",n),Q.addEventListener("click",()=>{const o=document.getElementById("custom-url").value.trim(),t=document.getElementById("custom-title").value.trim(),a=document.getElementById("custom-category").value.trim()||"Custom";if(!o||!t)return alert("URL and Title are required.");const c={url:o,title:t,category:a,sno:u.length+1};s.customQuestions.push(c),u.push(c),d(),n(),document.getElementById("custom-url").value="",document.getElementById("custom-title").value="",document.getElementById("custom-category").value="",r()})}function _(){const e=()=>{$.classList.add("open"),h.classList.add("open"),document.body.classList.add("no-scroll")},n=()=>{$.classList.remove("open"),h.classList.remove("open"),document.body.classList.remove("no-scroll")};A.addEventListener("click",e),R.addEventListener("click",n),h.addEventListener("click",n);const o=document.getElementById("reset-progress-btn");o&&o.addEventListener("click",()=>{confirm("Are you sure you want to completely reset all your progress? This cannot be undone.")&&(s.reviewCount={},s.tags={},s.opened={},s.notes={},s.skipped={},d(),r())});const t=document.getElementById("random-btn-toggle");t&&t.addEventListener("change",a=>{S.style.display=a.target.checked?"inline-flex":"none"})}function K(){const e=y.querySelector(".dropdown-btn"),n=()=>{e.innerHTML=l.tag?`Tag: ${l.tag} <span class="arrow">▼</span>`:'Filter by Tag <span class="arrow">▼</span>'},o=()=>{H.innerHTML=`
      <div class="dropdown-item" onclick="setTagFilter(null)">All Tags</div>
      ${M.map(t=>`<div class="dropdown-item" onclick="setTagFilter('${t}')">${t}</div>`).join("")}
    `};e.addEventListener("click",t=>{t.stopPropagation(),y.classList.toggle("open")}),document.addEventListener("click",()=>{y.classList.remove("open")}),window.setTagFilter=function(t){l.tag=t,B(),n(),r()},E.addEventListener("change",()=>{l.showNotes=E.checked,B(),r()}),o(),n()}function Z(){document.querySelectorAll(".col-toggle").forEach(e=>{e.addEventListener("change",n=>{v[n.target.value]=n.target.checked,r()})})}function V(){S.addEventListener("click",()=>{const n=O().filter(t=>!s.reviewCount[t.url]||s.reviewCount[t.url].count===0);if(n.length===0){m.innerHTML='<div style="padding:1rem; color:var(--text-muted)">You solved all visible questions!</div>';return}const o=n[Math.floor(Math.random()*n.length)];m.innerHTML=`
      <div class="list-header" style="display:flex; justify-content:space-between;">
        <span>🎲 Your Random Challenge</span>
        <button id="close-random-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✖</button>
      </div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${L(o,!1)}
      </div>
    `,m.querySelector("#close-random-btn").addEventListener("click",()=>{m.innerHTML=""})})}function N(){const e=Object.values(s.reviewCount).filter(o=>o.count>0).length,n=u.length-e;F.textContent=e,P.textContent=n}function x(){C.innerHTML="";const e={};Object.values(s.reviewCount).forEach(a=>{a.count>0&&a.lastDone&&(e[a.lastDone]=(e[a.lastDone]||0)+1)});const n=document.createElement("div");n.className="heatmap-grid";const o=new Date,t=[];for(let a=13;a>=0;a--){const c=new Date(o);c.setDate(o.getDate()-a),t.push(b(c))}t.forEach(a=>{const c=e[a]||0,i=document.createElement("div");i.className="heatmap-cell",c>0&&i.setAttribute("data-count",Math.min(c,5)),i.setAttribute("data-title",`${a}: ${c} reviews`),n.appendChild(i)}),C.appendChild(n)}function O(){return u.filter(e=>!(l.tag&&!(s.tags[e.url]||[]).includes(l.tag)))}function W(e){const n=s.tags[e]||[];let o="";if(n.forEach(t=>{const a=`badge-${t.toLowerCase()}`;o+=`<span class="badge badge-tag ${a}" onclick="toggleTag('${e}', '${t}', event)">${t} ✖</span>`}),o+=`<span class="badge badge-add" onclick="openTagPopover('${e}', event)">+ Add Tag</span>`,g===e){const t=M.map(a=>`<label class="matte-checkbox" style="padding: 0.25rem;"><input type="checkbox" ${n.includes(a)?"checked":""} onchange="toggleTag('${e}','${a}', event)"><span class="checkmark" style="width:14px;height:14px;"></span> ${a}</label>`).join("");o+=`<div class="tag-popover" onclick="event.stopPropagation()">${t}</div>`}return o}function L(e,n=!1){const o=s.reviewCount[e.url]||{count:0},t=o.count>0,a=!!s.notes[e.url],c=p.has(e.url)||l.showNotes&&a;let i="";return n&&(i=`<button class="btn-icon" style="font-size:0.8rem; margin-left: 0.5rem; opacity: 0.5;" onclick="removeCurrentlySolving('${e.url}', event)" title="Remove from Currently Solving">✖</button>`),`
    <div class="puzzle-card ${t?"is-done":""}">
      <div class="col-done">
        <button class="btn-review-count ${t?"active":""}" onclick="incrementReview('${e.url}')" title="Increment review count">
          ${t?"✓ "+o.count:"✓"}
        </button>
      </div>
      
      <div class="col-main">
        <div>
          <a href="${e.url}" target="_blank" class="puzzle-link" onclick="markOpened('${e.url}')">${e.sno}. ${e.title}</a>${i}
        </div>
        <div class="puzzle-meta">
          ${v.category?`<span class="badge badge-cat">${e.category}</span>`:""}
          ${s.skipped[e.url]?'<span class="badge badge-review">Skipped</span>':""}
        </div>
      </div>
      
      ${v.tags?`
      <div class="col-tags tags-container" style="position:relative;">
        ${W(e.url)}
      </div>
      `:""}
      
      <div class="col-actions">
        ${v.note?`
        <button class="btn-icon ${a?"active-note":""}" onclick="toggleNoteRow('${e.url}')" title="Notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        `:""}
        <button class="btn-icon" onclick="toggleSkip('${e.url}')" title="Toggle Skip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </button>
      </div>
      
      ${c?`
      <div class="note-container">
        <textarea class="note-input" placeholder="Write your notes here..." oninput="updateNote('${e.url}', this.value)">${s.notes[e.url]||""}</textarea>
      </div>
      `:""}
    </div>
  `}window.updateNote=function(e,n){const o=n.trim();o?s.notes[e]=o:delete s.notes[e],d()};function r(){f.innerHTML="",T.innerHTML="";const e=O();if(e.length===0){f.innerHTML='<div style="color:var(--text-muted); text-align:center; padding: 2rem;">No puzzles match your criteria.</div>';return}const n=[],o=[];e.forEach(t=>{(s.reviewCount[t.url]||{count:0}).count===0&&s.opened[t.url]?n.push(t):o.push(t)}),n.sort((t,a)=>s.opened[a.url]-s.opened[t.url]),n.length>0&&(T.innerHTML=`
      <div class="list-header">CURRENTLY SOLVING</div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${n.map(t=>L(t,!0)).join("")}
      </div>
    `),f.innerHTML=`
    <div class="list-header">ALL PUZZLES</div>
    <div class="puzzle-list">
      ${o.map(t=>L(t,!1)).join("")}
    </div>
  `}document.addEventListener("DOMContentLoaded",U);
