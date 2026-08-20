const DATA_KEY = 'gfgTrackerData';
const FILTERS_KEY = 'gfgTrackerFilters';

let allPuzzles = [];
let categoryOrder = [];

const DEFAULT_TAGS = ['Great', 'Good', 'Trivial', 'Hard', 'Review'];

let userData = {
  reviewCount: {}, // { url: { count, lastDone } }
  tags: {},        // { url: ['Great'] }
  opened: {},
  notes: {},
  skipped: {},
  customQuestions: [], // [{ url, title, category, sno }]
  customTags: []       // ['Great', 'Good', ...]
};

let filters = {
  tag: null, // null means all
  showNotes: false,
  sort: 'done',
  sortDir: 'asc'
};

let expandedNotes = new Set();
let tagPopoverOpenFor = null;

let visibleColumns = {
  note: true,
  tags: true,
  category: true
};

// DOM
const puzzlesContainer = document.getElementById('puzzles-container');
const currentlySolvingContainer = document.getElementById('currently-solving-container');
const heatmapContainer = document.getElementById('heatmap');
const unsolvedCountEl = document.getElementById('unsolved-count');
const solvedCountEl = document.getElementById('solved-count');

const tagFilterDropdown = document.getElementById('tag-filter-dropdown');
const tagFilterMenu = document.getElementById('tag-filter-menu');
const sortFilterDropdown = document.getElementById('sort-filter-dropdown');
const sortFilterMenu = document.getElementById('sort-filter-menu');

const showNotesCheckbox = document.getElementById('show-notes-filter');
const randomBtn = document.getElementById('random-btn');
const randomContainer = document.getElementById('random-question-container');

const hamburgerBtn = document.getElementById('hamburger-btn');
const sideDrawer = document.getElementById('side-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose = document.getElementById('drawer-close');

const addModalOverlay = document.getElementById('add-modal-overlay');
const addModal = document.getElementById('add-modal');
const openAddModalBtn = document.getElementById('open-add-modal-btn');
const addModalClose = document.getElementById('add-modal-close');
const saveCustomBtn = document.getElementById('save-custom-btn');

const tagManagerList = document.getElementById('tag-manager-list');
const newTagInput = document.getElementById('new-tag-input');
const addTagBtn = document.getElementById('add-tag-btn');

function getLocalDateString(dateObj = new Date()) {
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
}

async function init() {
  loadState();
  if (!userData.customTags || userData.customTags.length === 0) {
    userData.customTags = [...DEFAULT_TAGS];
  }
  await fetchPuzzles();
  setupDrawerLogic();
  setupTagManager();
  setupAddModalLogic();
  setupDropdownLogic();
  setupSortDropdownLogic();
  setupColumnToggles();
  setupRandomBtn();
  renderTopIndicator();
  renderHeatmap();
  renderPuzzles();
  
  document.addEventListener('click', (e) => {
    if (tagPopoverOpenFor && !e.target.closest('.tag-popover') && !e.target.closest('.badge-add')) {
      tagPopoverOpenFor = null;
      renderPuzzles();
    }
  });
}

async function fetchPuzzles() {
  try {
    const res = await fetch('./puzzles.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const rawData = await res.json();
    
    const uniqueMap = new Map();
    const seenCategories = new Set();

    rawData.forEach(p => {
      if (!uniqueMap.has(p.url)) {
        uniqueMap.set(p.url, p);
        const cat = p.category || 'Uncategorized';
        if (!seenCategories.has(cat)) {
          seenCategories.add(cat);
          categoryOrder.push(cat);
        }
      }
    });

    let uniqueData = Array.from(uniqueMap.values());
    
    // Add custom questions
    if (userData.customQuestions) {
      userData.customQuestions.forEach(cp => {
        if (!seenCategories.has(cp.category)) {
          seenCategories.add(cp.category);
          categoryOrder.push(cp.category);
        }
        uniqueData.push(cp);
      });
    }

    allPuzzles = uniqueData.map((p, index) => {
      return {
        ...p,
        sno: p.sno || (index + 1),
        category: p.category || 'Uncategorized'
      };
    });
  } catch (err) {
    console.error('Failed to fetch puzzles', err);
    puzzlesContainer.innerHTML = '<div style="color:var(--text-muted)">Failed to load data.</div>';
  }
}

function loadState() {
  try {
    const savedData = localStorage.getItem(DATA_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      userData.reviewCount = parsed.reviewCount || {};
      userData.tags = parsed.tags || {};
      userData.opened = parsed.opened || {};
      userData.notes = parsed.notes || {};
      userData.skipped = parsed.skipped || {};
      userData.customQuestions = parsed.customQuestions || [];
      userData.customTags = parsed.customTags || [];
    }
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      if (parsed.tag !== undefined) filters.tag = parsed.tag;
      if (typeof parsed.showNotes === 'boolean') filters.showNotes = parsed.showNotes;
      if (parsed.sort) filters.sort = parsed.sort;
      if (parsed.sortDir) filters.sortDir = parsed.sortDir;
      showNotesCheckbox.checked = filters.showNotes;
    }
  } catch(e) {}
}

function saveUserData() {
  localStorage.setItem(DATA_KEY, JSON.stringify(userData));
  renderTopIndicator();
  renderHeatmap();
}

function saveFilters() {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

window.incrementReview = function(url) {
  if (!userData.reviewCount[url]) {
    userData.reviewCount[url] = { count: 0, lastDone: null };
  }
  userData.reviewCount[url].count += 1;
  userData.reviewCount[url].lastDone = getLocalDateString();
  
  if (userData.opened[url]) delete userData.opened[url];
  
  saveUserData();
  renderPuzzles();
};

window.setReviewCount = function(url, val) {
  let count = parseInt(val, 10);
  if (isNaN(count) || count < 0) count = 0;
  
  if (!userData.reviewCount[url]) {
    userData.reviewCount[url] = { count: 0, lastDone: null };
  }
  userData.reviewCount[url].count = count;
  if (count > 0 && !userData.reviewCount[url].lastDone) {
    userData.reviewCount[url].lastDone = getLocalDateString();
  }
  
  if (count > 0 && userData.opened[url]) delete userData.opened[url];
  
  saveUserData();
  renderPuzzles();
};

window.toggleTag = function(url, tag, e) {
  if (e) e.stopPropagation();
  if (!userData.tags[url]) userData.tags[url] = [];
  const idx = userData.tags[url].indexOf(tag);
  if (idx > -1) {
    userData.tags[url].splice(idx, 1);
  } else {
    userData.tags[url] = [tag];
    tagPopoverOpenFor = null;
  }
  saveUserData();
  renderPuzzles();
};

window.openTagPopover = function(url, e) {
  e.stopPropagation();
  tagPopoverOpenFor = tagPopoverOpenFor === url ? null : url;
  renderPuzzles();
};

window.toggleSkip = function(url) {
  if (userData.skipped[url]) {
    delete userData.skipped[url];
  } else {
    userData.skipped[url] = Date.now();
  }
  saveUserData();
  renderPuzzles();
};

window.toggleNoteRow = function(url) {
  if (expandedNotes.has(url)) {
    expandedNotes.delete(url);
  } else {
    expandedNotes.add(url);
  }
  renderPuzzles();
};

window.markOpened = function(url) {
  userData.opened[url] = Date.now();
  saveUserData();
  renderPuzzles(); 
};

window.removeCurrentlySolving = function(url, e) {
  e.stopPropagation();
  e.preventDefault();
  delete userData.opened[url];
  saveUserData();
  renderPuzzles();
};

// TAG MANAGER
function setupTagManager() {
  const renderTagManager = () => {
    tagManagerList.innerHTML = userData.customTags.map((tag, idx) => `
      <div class="tag-list-item">
        <input type="text" class="matte-input" style="padding: 0.25rem 0.5rem; flex: 1; border: none; background: transparent;" value="${tag}" onchange="editCustomTag(${idx}, this.value)">
        <button class="btn-icon" style="padding:0; color:var(--danger);" onclick="deleteCustomTag(${idx})">✖</button>
      </div>
    `).join('');
    buildTagFilterMenu();
  };

  window.editCustomTag = function(idx, val) {
    const newVal = val.trim();
    if (newVal && newVal !== userData.customTags[idx] && !userData.customTags.includes(newVal)) {
      const oldVal = userData.customTags[idx];
      userData.customTags[idx] = newVal;
      
      // Update references in all puzzles
      Object.keys(userData.tags).forEach(url => {
        const tIdx = userData.tags[url].indexOf(oldVal);
        if (tIdx > -1) userData.tags[url][tIdx] = newVal;
      });
      
      saveUserData();
      renderTagManager();
      renderPuzzles();
    } else {
      renderTagManager(); // revert
    }
  };

  window.deleteCustomTag = function(idx) {
    const oldVal = userData.customTags[idx];
    if (confirm(`Delete tag "${oldVal}"?`)) {
      userData.customTags.splice(idx, 1);
      
      Object.keys(userData.tags).forEach(url => {
        const tIdx = userData.tags[url].indexOf(oldVal);
        if (tIdx > -1) userData.tags[url].splice(tIdx, 1);
      });
      
      saveUserData();
      renderTagManager();
      renderPuzzles();
    }
  };

  addTagBtn.addEventListener('click', () => {
    const val = newTagInput.value.trim();
    if (val && !userData.customTags.includes(val)) {
      userData.customTags.push(val);
      saveUserData();
      newTagInput.value = '';
      renderTagManager();
    }
  });

  renderTagManager();
}

// MODAL UI LOGIC
function setupAddModalLogic() {
  const openModal = () => {
    addModal.classList.add('open');
    addModalOverlay.classList.add('open');
    document.body.classList.add('no-scroll');
  };
  const closeModal = () => {
    addModal.classList.remove('open');
    addModalOverlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  openAddModalBtn.addEventListener('click', openModal);
  addModalClose.addEventListener('click', closeModal);
  addModalOverlay.addEventListener('click', closeModal);

  saveCustomBtn.addEventListener('click', () => {
    const url = document.getElementById('custom-url').value.trim();
    const title = document.getElementById('custom-title').value.trim();
    const category = document.getElementById('custom-category').value.trim() || 'Custom';

    if (!url || !title) return alert("URL and Title are required.");

    const newQuestion = { url, title, category, sno: allPuzzles.length + 1 };
    userData.customQuestions.push(newQuestion);
    allPuzzles.push(newQuestion);
    
    // Add to currently solving automatically
    userData.opened[url] = Date.now();
    
    saveUserData();
    closeModal();
    
    document.getElementById('custom-url').value = '';
    document.getElementById('custom-title').value = '';
    document.getElementById('custom-category').value = '';
    
    renderPuzzles();
  });
}

// DRAWER UI LOGIC
function setupDrawerLogic() {
  const openDrawer = () => {
    sideDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.classList.add('no-scroll');
  };
  const closeDrawer = () => {
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  hamburgerBtn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  const resetBtn = document.getElementById('reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to completely reset all your progress? This cannot be undone.")) {
        userData.reviewCount = {};
        userData.tags = {};
        userData.opened = {};
        userData.notes = {};
        userData.skipped = {};
        saveUserData();
        renderPuzzles();
      }
    });
  }

  const randomBtnToggle = document.getElementById('random-btn-toggle');
  if (randomBtnToggle) {
    randomBtnToggle.addEventListener('change', (e) => {
      randomBtn.style.display = e.target.checked ? 'inline-flex' : 'none';
    });
  }
}

function buildTagFilterMenu() {
  tagFilterMenu.innerHTML = `
    <div class="dropdown-item" onclick="setTagFilter(null)">All Tags</div>
    ${userData.customTags.map(t => `<div class="dropdown-item" onclick="setTagFilter('${t}')">${t}</div>`).join('')}
  `;
}

function setupDropdownLogic() {
  const btn = tagFilterDropdown.querySelector('.dropdown-btn');
  
  const updateBtnText = () => {
    btn.innerHTML = filters.tag ? `Tag: ${filters.tag} <span class="arrow">▼</span>` : `Filter by Tag <span class="arrow">▼</span>`;
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    tagFilterDropdown.classList.toggle('open');
    sortFilterDropdown.classList.remove('open');
  });

  document.addEventListener('click', () => {
    tagFilterDropdown.classList.remove('open');
  });

  window.setTagFilter = function(tag) {
    filters.tag = tag;
    saveFilters();
    updateBtnText();
    renderPuzzles();
  };

  showNotesCheckbox.addEventListener('change', () => {
    filters.showNotes = showNotesCheckbox.checked;
    saveFilters();
    renderPuzzles();
  });

  buildTagFilterMenu();
  updateBtnText();
}

function setupSortDropdownLogic() {
  const btn = sortFilterDropdown.querySelector('.dropdown-btn');
  
  const updateBtnText = () => {
    let lbl = '';
    if (filters.sort === 'done') lbl = 'Done';
    if (filters.sort === 'sno') lbl = 'Sno';
    if (filters.sort === 'title') lbl = 'Title';
    if (filters.sort === 'category') lbl = 'Category';
    const dirLbl = filters.sortDir === 'asc' ? '(Asc)' : '(Desc)';
    btn.innerHTML = `Sort By: ${lbl} ${dirLbl} <span class="arrow">▼</span>`;
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortFilterDropdown.classList.toggle('open');
    tagFilterDropdown.classList.remove('open');
  });

  document.addEventListener('click', () => {
    sortFilterDropdown.classList.remove('open');
  });

  window.setSortFilter = function(sortCol, dir) {
    filters.sort = sortCol;
    filters.sortDir = dir;
    saveFilters();
    updateBtnText();
    renderPuzzles();
  };
  
  updateBtnText();
}

function setupColumnToggles() {
  document.querySelectorAll('.col-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      visibleColumns[e.target.value] = e.target.checked;
      renderPuzzles();
    });
  });
}

// RANDOM QUESTION
function setupRandomBtn() {
  randomBtn.addEventListener('click', () => {
    const puzzles = getProcessedPuzzles();
    const unsolved = puzzles.filter(p => !userData.reviewCount[p.url] || userData.reviewCount[p.url].count === 0);
    
    if (unsolved.length === 0) {
      randomContainer.innerHTML = '<div style="padding:1rem; color:var(--text-muted)">You solved all visible questions!</div>';
      return;
    }

    const rnd = unsolved[Math.floor(Math.random() * unsolved.length)];
    
    randomContainer.innerHTML = `
      <div class="list-header" style="display:flex; justify-content:space-between;">
        <span>🎲 Your Random Challenge</span>
        <button id="close-random-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✖</button>
      </div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${createCardHTML(rnd, false)}
      </div>
    `;
    
    randomContainer.querySelector('#close-random-btn').addEventListener('click', () => {
      randomContainer.innerHTML = '';
    });
  });
}

// RENDERING
function renderTopIndicator() {
  const solved = Object.values(userData.reviewCount).filter(rc => rc.count > 0).length;
  const unsolved = allPuzzles.length - solved;
  solvedCountEl.textContent = solved;
  unsolvedCountEl.textContent = unsolved;
}

function renderHeatmap() {
  heatmapContainer.innerHTML = '';
  const activity = {};
  Object.values(userData.reviewCount).forEach(rc => {
    if (rc.count > 0 && rc.lastDone) {
      activity[rc.lastDone] = (activity[rc.lastDone] || 0) + 1;
    }
  });

  const grid = document.createElement('div');
  grid.className = 'heatmap-grid';
  
  const today = new Date();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(getLocalDateString(d));
  }

  days.forEach(dateStr => {
    const count = activity[dateStr] || 0;
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    if (count > 0) {
      cell.setAttribute('data-count', Math.min(count, 5));
      cell.textContent = count;
    }
    cell.setAttribute('data-title', `${dateStr}: ${count} reviews`);
    grid.appendChild(cell);
  });

  heatmapContainer.appendChild(grid);
}

function getProcessedPuzzles() {
  return allPuzzles.filter(p => {
    if (filters.tag) {
      const pTags = userData.tags[p.url] || [];
      if (!pTags.includes(filters.tag)) return false;
    }
    return true;
  });
}

function renderTagBadges(url) {
  const pTags = userData.tags[url] || [];
  let html = '';
  pTags.forEach(t => {
    const cls = `badge-${t.toLowerCase()}`;
    html += `<span class="badge badge-tag ${cls}" onclick="toggleTag('${url}', '${t}', event)">${t} ✖</span>`;
  });
  
  if (pTags.length === 0) {
    html += `<span class="badge badge-add" onclick="openTagPopover('${url}', event)">+ Tag</span>`;
  }
  
  if (tagPopoverOpenFor === url) {
    const opts = userData.customTags.map(t => {
      const has = pTags.includes(t);
      return `<label class="matte-checkbox" style="padding: 0.25rem;"><input type="checkbox" ${has?'checked':''} onchange="toggleTag('${url}','${t}', event)"><span class="checkmark" style="width:14px;height:14px;"></span> ${t}</label>`;
    }).join('');
    html += `<div class="tag-popover" onclick="event.stopPropagation()">${opts}</div>`;
  }
  
  return html;
}

function createCardHTML(p, isCurrentlySolving = false) {
  const rc = userData.reviewCount[p.url] || { count: 0 };
  const isDone = rc.count > 0;
  const hasNote = !!userData.notes[p.url];
  const isExpanded = expandedNotes.has(p.url) || (filters.showNotes && hasNote);
  const hasPopoverOpen = tagPopoverOpenFor === p.url;

  let dismissBtn = '';
  if (isCurrentlySolving) {
    dismissBtn = `<button class="btn-icon" style="font-size:0.8rem; margin-left: 0.5rem; opacity: 0.5;" onclick="removeCurrentlySolving('${p.url}', event)" title="Remove from Currently Solving">✖</button>`;
  }

  return `
    <div class="puzzle-card ${isDone ? 'is-done' : ''}" style="${hasPopoverOpen ? 'z-index: 100;' : ''}">
      <div class="col-actions">
        ${visibleColumns.note ? `
        <button class="btn-icon action-note ${hasNote ? 'active-note' : ''}" onclick="toggleNoteRow('${p.url}')" title="Notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        ` : ''}
        
        ${visibleColumns.tags ? `
        <div class="tags-container action-tags" style="position:relative;">
          ${renderTagBadges(p.url)}
        </div>
        ` : ''}

        <button 
          class="btn-check action-check ${isDone ? 'active' : ''}" 
          onclick="incrementReview('${p.url}')" 
          title="Increment">+</button>

        <input type="number" class="count-input action-count" value="${rc.count}" onchange="setReviewCount('${p.url}', this.value)" min="0">
      </div>

      <div class="col-main">
        <div>
          <a href="${p.url}" target="_blank" class="puzzle-link" onclick="markOpened('${p.url}')">${p.sno}. ${p.title}</a>${dismissBtn}
        </div>
        <div class="puzzle-meta">
          ${visibleColumns.category ? `<span class="badge badge-cat">${p.category}</span>` : ''}
          ${userData.skipped[p.url] ? `<span class="badge badge-review">Skipped</span>` : ''}
        </div>
      </div>
      
      <div class="col-skip">
        <button class="btn-icon" onclick="toggleSkip('${p.url}')" title="Toggle Skip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </button>
      </div>
      
      ${isExpanded ? `
      <div class="note-container">
        <textarea class="note-input" placeholder="Write your notes here..." oninput="updateNote('${p.url}', this.value)">${userData.notes[p.url] || ''}</textarea>
      </div>
      ` : ''}
    </div>
  `;
}

window.updateNote = function(url, val) {
  const trimmed = val.trim();
  if (trimmed) {
    userData.notes[url] = trimmed;
  } else {
    delete userData.notes[url];
  }
  saveUserData();
};

function renderPuzzles() {
  puzzlesContainer.innerHTML = '';
  currentlySolvingContainer.innerHTML = '';
  const puzzles = getProcessedPuzzles();
  
  if (puzzles.length === 0) {
    puzzlesContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 2rem;">No puzzles match your criteria.</div>';
    return;
  }

  const currentlySolving = [];
  const others = [];
  
  puzzles.forEach(p => {
    // If it is in userData.opened, put it in Currently Solving
    if (userData.opened[p.url]) {
      currentlySolving.push(p);
    } else {
      others.push(p);
    }
  });

  currentlySolving.sort((a, b) => userData.opened[b.url] - userData.opened[a.url]);

  // Sort Others
  others.sort((a, b) => {
    let valA, valB;
    
    if (filters.sort === 'done') {
      const getDoneStatus = (url) => {
        const rc = userData.reviewCount[url];
        if (rc && rc.count > 0) return 1;
        if (userData.skipped[url]) return 0.5; // Skipped goes in middle
        return 0; // Uncompleted goes to top
      };
      valA = getDoneStatus(a.url);
      valB = getDoneStatus(b.url);
      
      // Secondary sort by Sno if done status is equal
      if (valA === valB) {
         return a.sno - b.sno;
      }
    } else if (filters.sort === 'sno') {
      valA = a.sno; valB = b.sno;
    } else if (filters.sort === 'title') {
      valA = a.title.toLowerCase(); valB = b.title.toLowerCase();
    } else if (filters.sort === 'category') {
      valA = a.category.toLowerCase(); valB = b.category.toLowerCase();
    }
    
    if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (currentlySolving.length > 0) {
    currentlySolvingContainer.innerHTML = `
      <div class="list-header">CURRENTLY SOLVING</div>
      <div class="puzzle-list" style="margin-bottom: 2rem;">
        ${currentlySolving.map(p => createCardHTML(p, true)).join('')}
      </div>
    `;
  }

  puzzlesContainer.innerHTML = `
    <div class="list-header">ALL PUZZLES</div>
    <div class="puzzle-list">
      ${others.map(p => createCardHTML(p, false)).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);
