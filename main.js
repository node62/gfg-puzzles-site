const DATA_KEY = 'gfgTrackerData';
const FILTERS_KEY = 'gfgTrackerFilters';

let allPuzzles = [];
let uniqueCompanies = new Set();
let categoryOrder = [];

let userData = {
  starred: [], 
  completed: {},
  opened: {},
  notes: {}
};

let filters = {
  companies: [],
  starredOnly: false,
  showNotes: false,
  sortCol: 'done',
  sortDir: 'asc'
};

let expandedNotes = new Set();

let visibleColumns = {
  sno: true,
  category: true,
  title: true,
  companies: false 
};

// DOM
const puzzlesContainer = document.getElementById('puzzles-container');
const currentlySolvingContainer = document.getElementById('currently-solving-container');
const heatmapContainer = document.getElementById('heatmap');
const unsolvedCountEl = document.getElementById('unsolved-count');
const solvedCountEl = document.getElementById('solved-count');

const columnsBtn = document.getElementById('columns-btn');
const columnsMenu = document.getElementById('columns-menu');
const starredCheckbox = document.getElementById('starred-filter');
const showNotesCheckbox = document.getElementById('show-notes-filter');
const randomBtn = document.getElementById('random-btn');
const randomContainer = document.getElementById('random-question-container');

const hamburgerBtn = document.getElementById('hamburger-btn');
const sideDrawer = document.getElementById('side-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose = document.getElementById('drawer-close');
const companySearch = document.getElementById('company-search');
const companyList = document.getElementById('company-list');
const companyAllCb = document.getElementById('company-all');

function getLocalDateString(dateObj = new Date()) {
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
}

function getCategoryColor(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 65%)`; 
}

async function init() {
  loadState();
  await fetchPuzzles();
  populateCompanyDropdown();
  setupDropdownLogic();
  setupDrawerLogic();
  setupColumnToggles();
  setupRandomBtn();
  renderTopIndicator();
  renderHeatmap();
  renderPuzzles();
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

    const uniqueData = Array.from(uniqueMap.values());

    allPuzzles = uniqueData.map((p, index) => {
      if (p.companies_asked) {
        p.companies_asked.forEach(c => uniqueCompanies.add(c.trim()));
      }
      return {
        ...p,
        sno: index + 1,
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
      userData = JSON.parse(savedData);
      if (!userData.starred) userData.starred = [];
      if (!userData.completed) userData.completed = {};
      if (!userData.opened) userData.opened = {};
      if (!userData.notes) userData.notes = {};
    }
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      if (parsed.companies) filters.companies = parsed.companies;
      if (typeof parsed.starredOnly === 'boolean') filters.starredOnly = parsed.starredOnly;
      if (typeof parsed.showNotes === 'boolean') filters.showNotes = parsed.showNotes;
      if (parsed.sortCol) filters.sortCol = parsed.sortCol;
      if (parsed.sortDir) filters.sortDir = parsed.sortDir;
      
      starredCheckbox.checked = filters.starredOnly;
      showNotesCheckbox.checked = filters.showNotes;
      companyAllCb.checked = filters.companies.length === 0;
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

function toggleStar(url) {
  if (userData.starred.includes(url)) {
    userData.starred = userData.starred.filter(u => u !== url);
  } else {
    userData.starred.push(url);
  }
  saveUserData();
  renderPuzzles();
}

function toggleDone(url) {
  if (userData.completed[url]) {
    delete userData.completed[url];
  } else {
    userData.completed[url] = getLocalDateString();
  }
  saveUserData();
  renderPuzzles();
}

function toggleNoteRow(url) {
  if (expandedNotes.has(url)) {
    expandedNotes.delete(url);
  } else {
    expandedNotes.add(url);
  }
  renderPuzzles();
}

function markOpened(url) {
  userData.opened[url] = Date.now();
  saveUserData();
  renderPuzzles(); 
}

function removeCurrentlySolving(url, e) {
  e.stopPropagation();
  e.preventDefault();
  delete userData.opened[url];
  saveUserData();
  renderPuzzles();
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

  companySearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.company-item').forEach(lbl => {
      const text = lbl.textContent.toLowerCase();
      lbl.style.display = text.includes(term) ? 'flex' : 'none';
    });
    
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
      resetBtn.style.display = term ? 'none' : 'block';
    }
  });

  const resetBtn = document.getElementById('reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to completely reset all your progress? This cannot be undone.")) {
        userData.completed = {};
        userData.starred = [];
        userData.opened = {};
        userData.notes = {};
        saveUserData();
        renderPuzzles();
      }
    });
  }
}

function populateCompanyDropdown() {
  const companies = Array.from(uniqueCompanies).sort((a, b) => a.localeCompare(b));
  
  companyAllCb.addEventListener('change', (e) => {
    if (e.target.checked) {
      filters.companies = [];
      document.querySelectorAll('.company-cb').forEach(cb => cb.checked = false);
      saveFilters();
      renderPuzzles();
    } else {
      if (filters.companies.length === 0) e.target.checked = true;
    }
  });

  companies.forEach(c => {
    const label = document.createElement('label');
    label.className = 'matte-checkbox menu-item company-item';
    
    const isChecked = filters.companies.includes(c);
    
    label.innerHTML = `
      <input type="checkbox" class="company-cb" value="${c}" ${isChecked ? 'checked' : ''}>
      <span class="checkmark"></span>
      ${c}
    `;
    companyList.appendChild(label);
  });

  document.querySelectorAll('.company-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedBoxes = Array.from(document.querySelectorAll('.company-cb:checked')).map(el => el.value);
      filters.companies = checkedBoxes;
      companyAllCb.checked = checkedBoxes.length === 0;
      saveFilters();
      renderPuzzles();
    });
  });
}

// VIEW DROPDOWN
function setupDropdownLogic() {
  columnsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('columns-dropdown').classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#columns-dropdown')) {
      document.getElementById('columns-dropdown').classList.remove('open');
    }
  });

  columnsMenu.addEventListener('click', e => e.stopPropagation());

  starredCheckbox.addEventListener('change', () => {
    filters.starredOnly = starredCheckbox.checked;
    saveFilters();
    renderPuzzles();
  });
  
  showNotesCheckbox.addEventListener('change', () => {
    filters.showNotes = showNotesCheckbox.checked;
    saveFilters();
    renderPuzzles();
  });
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
    const unsolved = puzzles.filter(p => !userData.completed[p.url]);
    
    if (unsolved.length === 0) {
      randomContainer.innerHTML = '<div style="padding:1rem; color:var(--text-muted)">You solved all visible questions!</div>';
      return;
    }

    const rnd = unsolved[Math.floor(Math.random() * unsolved.length)];
    
    let companiesText = '';
    if (rnd.companies_asked && rnd.companies_asked.length > 0) {
      companiesText = rnd.companies_asked.join(', ');
    }

    randomContainer.innerHTML = `
      <div class="section-container" style="margin-bottom: 1rem;">
        <div class="section-header" style="color:var(--accent-color); font-size:0.9rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
          <span>🎲 Your Random Challenge</span>
          <button id="close-random-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✖</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <tbody>
              <tr>
                <td class="col-note"><button class="btn-icon" onclick="toggleNoteRow('${rnd.url}')">✎</button></td>
                <td class="col-done"><button class="btn-done-box" onclick="toggleDone('${rnd.url}'); document.getElementById('random-question-container').innerHTML=''">✓</button></td>
                <td class="col-star"><button class="btn-icon btn-star ${userData.starred.includes(rnd.url) ? 'active' : ''}" onclick="toggleStar('${rnd.url}')">${userData.starred.includes(rnd.url) ? '★' : '☆'}</button></td>
                ${visibleColumns.sno ? `<td class="col-sno">${rnd.sno}.</td>` : ''}
                ${visibleColumns.title ? `<td class="col-title"><a href="${rnd.url}" target="_blank" class="puzzle-link" onclick="markOpened('${rnd.url}')">${rnd.title}</a></td>` : ''}
                ${visibleColumns.category ? `<td class="col-category" style="color:${getCategoryColor(rnd.category)}; font-size:0.8rem; font-weight:700;">${rnd.category}</td>` : ''}
                ${visibleColumns.companies ? `<td class="col-companies">${companiesText}</td>` : ''}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    randomContainer.querySelector('#close-random-btn').addEventListener('click', () => {
      randomContainer.innerHTML = '';
    });
    
    const starBtn = randomContainer.querySelector('.btn-star');
    starBtn.addEventListener('click', () => {
      starBtn.classList.toggle('active');
      starBtn.textContent = starBtn.classList.contains('active') ? '★' : '☆';
    });
  });
}

// RENDERING
function renderTopIndicator() {
  const solved = Object.keys(userData.completed).length;
  const unsolved = allPuzzles.length - solved;
  solvedCountEl.textContent = solved;
  unsolvedCountEl.textContent = unsolved;
}

function renderHeatmap() {
  heatmapContainer.innerHTML = '';
  
  const activity = {};
  Object.values(userData.completed).forEach(date => {
    activity[date] = (activity[date] || 0) + 1;
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
    cell.className = 'heatmap-cell heat-0';
    
    if (count > 0 && count <= 2) cell.className = 'heatmap-cell heat-1';
    else if (count > 2 && count <= 5) cell.className = 'heatmap-cell heat-2';
    else if (count > 5 && count <= 8) cell.className = 'heatmap-cell heat-3';
    else if (count > 8) cell.className = 'heatmap-cell heat-4';

    cell.setAttribute('data-title', `${dateStr}: ${count} solved`);
    if (count > 0) {
      cell.textContent = count;
    }
    
    grid.appendChild(cell);
  });

  heatmapContainer.appendChild(grid);
}

function handleSort(column) {
  if (filters.sortCol === column) {
    filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.sortCol = column;
    filters.sortDir = 'asc';
  }
  saveFilters();
  renderPuzzles();
}

function getSortIcon(col) {
  if (filters.sortCol !== col) return '';
  return filters.sortDir === 'asc' ? ' ▲' : ' ▼';
}

function getProcessedPuzzles() {
  return allPuzzles.filter(p => {
    if (filters.starredOnly && !userData.starred.includes(p.url)) return false;
    if (filters.companies.length > 0) {
      if (!p.companies_asked) return false;
      const match = p.companies_asked.some(c => filters.companies.includes(c.trim()));
      if (!match) return false;
    }
    return true;
  });
}

function createRowHTML(p, isCurrentlySolving = false) {
  const isDone = !!userData.completed[p.url];
  const isStarred = userData.starred.includes(p.url);
  const hasNote = !!userData.notes[p.url];
  
  let companiesText = '';
  if (p.companies_asked && p.companies_asked.length > 0) {
    companiesText = p.companies_asked.join(', ');
  }

  let dismissBtn = '';
  if (isCurrentlySolving) {
    dismissBtn = `<button class="btn-icon" style="font-size:0.8rem; margin-left: 0.5rem; opacity: 0.5;" onclick="removeCurrentlySolving('${p.url}', event)" title="Remove from Currently Solving">✖</button>`;
  }

  return `
    <td class="col-note">
      <button class="btn-icon ${hasNote ? 'active' : ''}" style="${hasNote ? 'color: var(--accent-color);' : ''}" onclick="toggleNoteRow('${p.url}')">✎</button>
    </td>
    <td class="col-done">
      <button class="btn-done-box ${isDone ? 'active' : ''}" data-url="${p.url}">✓</button>
    </td>
    <td class="col-star">
      <button class="btn-icon btn-star ${isStarred ? 'active' : ''}" data-url="${p.url}">${isStarred ? '★' : '☆'}</button>
    </td>
    ${visibleColumns.sno ? `<td class="col-sno">${p.sno}.</td>` : ''}
    ${visibleColumns.title ? `<td class="col-title"><a href="${p.url}" target="_blank" class="puzzle-link" onclick="markOpened('${p.url}')">${p.title}</a>${dismissBtn}</td>` : ''}
    ${visibleColumns.category ? `<td class="col-category" style="color:${getCategoryColor(p.category)}; font-size:0.8rem; font-weight:700;">${p.category}</td>` : ''}
    ${visibleColumns.companies ? `<td class="col-companies">${companiesText}</td>` : ''}
  `;
}

function attachRowListeners(tr, p) {
  const doneBtn = tr.querySelector('.btn-done-box');
  doneBtn.addEventListener('click', () => toggleDone(p.url));

  const starBtn = tr.querySelector('.btn-star');
  starBtn.addEventListener('click', () => toggleStar(p.url));
}

function getColCount() {
  let colCount = 3; // note + done + star
  if (visibleColumns.sno) colCount++;
  if (visibleColumns.title) colCount++;
  if (visibleColumns.category) colCount++;
  if (visibleColumns.companies) colCount++;
  return colCount;
}

function appendNoteRowIfNeeded(tbody, p, colCount) {
  const isExpanded = expandedNotes.has(p.url) || (filters.showNotes && !!userData.notes[p.url]);
  if (!isExpanded) return;
  
  const tr = document.createElement('tr');
  tr.className = 'note-row';
  
  const td = document.createElement('td');
  td.colSpan = colCount;
  
  const textarea = document.createElement('textarea');
  textarea.className = 'note-input';
  textarea.placeholder = 'Write your notes here...';
  textarea.value = userData.notes[p.url] || '';
  
  // Auto-resize
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
  });
  
  // Save on blur or input
  textarea.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      userData.notes[p.url] = val;
    } else {
      delete userData.notes[p.url];
    }
    saveUserData();
  });
  
  td.appendChild(textarea);
  tr.appendChild(td);
  tbody.appendChild(tr);
  
  // Initial resize
  requestAnimationFrame(() => {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
  });
}

function renderPuzzles() {
  puzzlesContainer.innerHTML = '';
  currentlySolvingContainer.innerHTML = '';
  const puzzles = getProcessedPuzzles();
  
  if (puzzles.length === 0) {
    puzzlesContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 2rem;">No puzzles match your criteria.</div>';
    return;
  }

  // Split into "Currently Solving" (Unsolved + Opened) and "Others"
  const currentlySolving = [];
  const others = [];
  
  puzzles.forEach(p => {
    if (!userData.completed[p.url] && userData.opened[p.url]) {
      currentlySolving.push(p);
    } else {
      others.push(p);
    }
  });

  // Sort Currently Solving (Newest Opened First)
  currentlySolving.sort((a, b) => userData.opened[b.url] - userData.opened[a.url]);

  // Sort Others normally based on headers
  others.sort((a, b) => {
    let valA, valB;
    if (filters.sortCol === 'done') {
      valA = !!userData.completed[a.url] ? 1 : 0;
      valB = !!userData.completed[b.url] ? 1 : 0;
    } else if (filters.sortCol === 'star') {
      valA = userData.starred.includes(a.url) ? 1 : 0;
      valB = userData.starred.includes(b.url) ? 1 : 0;
    } else if (filters.sortCol === 'title') {
      valA = a.title.toLowerCase();
      valB = b.title.toLowerCase();
    } else if (filters.sortCol === 'category') {
      valA = categoryOrder.indexOf(a.category);
      valB = categoryOrder.indexOf(b.category);
    } else if (filters.sortCol === 'companies') {
      valA = (a.companies_asked || []).join(', ').toLowerCase();
      valB = (b.companies_asked || []).join(', ').toLowerCase();
    }

    if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
    
    return a.sno - b.sno; 
  });

  const colCount = getColCount();

  // 1. Render "Currently Solving"
  if (currentlySolving.length > 0) {
    const csWrapper = document.createElement('div');
    csWrapper.className = 'table-responsive';
    csWrapper.style.marginBottom = '2rem';

    const csTitle = document.createElement('div');
    csTitle.style.cssText = 'color: var(--accent-color); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 0.5rem;';
    csTitle.textContent = 'Currently Solving';
    csWrapper.appendChild(csTitle);

    const tableCS = document.createElement('table');
    tableCS.className = 'data-table';
    
    const tbodyCS = document.createElement('tbody');
    currentlySolving.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = createRowHTML(p, true);
      attachRowListeners(tr, p);
      tbodyCS.appendChild(tr);
      appendNoteRowIfNeeded(tbodyCS, p, colCount);
    });
    tableCS.appendChild(tbodyCS);
    csWrapper.appendChild(tableCS);
    currentlySolvingContainer.appendChild(csWrapper);
  }

  // 2. Render Main Table
  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'table-responsive';

  const tableMain = document.createElement('table');
  tableMain.className = 'data-table';
  
  const thead = document.createElement('thead');
  const isCol = (c) => filters.sortCol === c ? 'active-sort' : '';
  
  thead.innerHTML = `
    <tr>
      <th style="width: 50px;">Note</th>
      <th class="sortable col-done ${isCol('done')}" data-col="done">Done${getSortIcon('done')}</th>
      <th class="sortable col-star ${isCol('star')}" data-col="star">Star${getSortIcon('star')}</th>
      ${visibleColumns.sno ? `<th>S.No</th>` : ''}
      ${visibleColumns.title ? `<th class="sortable col-title ${isCol('title')}" data-col="title">Title${getSortIcon('title')}</th>` : ''}
      ${visibleColumns.category ? `<th class="sortable col-category ${isCol('category')}" data-col="category">Category${getSortIcon('category')}</th>` : ''}
      ${visibleColumns.companies ? `<th class="sortable col-companies ${isCol('companies')}" data-col="companies">Companies${getSortIcon('companies')}</th>` : ''}
    </tr>
  `;
  
  thead.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => handleSort(th.getAttribute('data-col')));
  });
  tableMain.appendChild(thead);

  const tbodyOthers = document.createElement('tbody');
  others.forEach(p => {
    const tr = document.createElement('tr');
    if (!!userData.completed[p.url]) tr.classList.add('is-done');
    tr.innerHTML = createRowHTML(p, false);
    attachRowListeners(tr, p);
    tbodyOthers.appendChild(tr);
    appendNoteRowIfNeeded(tbodyOthers, p, colCount);
  });
  tableMain.appendChild(tbodyOthers);

  mainWrapper.appendChild(tableMain);
  puzzlesContainer.appendChild(mainWrapper);
}

window.toggleDone = toggleDone;
window.toggleStar = toggleStar;
window.markOpened = markOpened;
window.removeCurrentlySolving = removeCurrentlySolving;
window.toggleNoteRow = toggleNoteRow;

document.addEventListener('DOMContentLoaded', init);
