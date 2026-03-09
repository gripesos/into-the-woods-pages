const W = 640, H = 420, SCENE_H = 360, UI_Y = 360;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const elMsg = document.getElementById('msg');
const elStatus = document.getElementById('status');
const elChapterPanel = document.getElementById('chapterPanel');
const elChapterTitle = document.getElementById('chapterTitle');
const elChapterObjective = document.getElementById('chapterObjective');
const elChapterFlags = document.getElementById('chapterFlags');
const elDialogue = document.getElementById('dialogue');
const elDlgSpeaker = document.getElementById('dlgSpeaker');
const elDlgLine = document.getElementById('dlgLine');
const elDlgChoices = document.getElementById('dlgChoices');
const elStyleSelect = document.getElementById('styleSelect');
const elBtnApplyStyle = document.getElementById('btnApplyStyle');
const elBtnCycleStyle = document.getElementById('btnCycleStyle');
const elDialogueSelect = document.getElementById('dialogueSelect');
const elBtnStartDialogue = document.getElementById('btnStartDialogue');
const elBtnRandomDialogue = document.getElementById('btnRandomDialogue');

const state = {
  scenes: {},
  items: {},
  dialogues: {},
  events: { hotspots: {}, entities: {}, useRules: {}, questChecks: [] },

  currentSceneId: 'cabin',
  sceneBgPath: {},
  bgCache: new Map(),

  styles: {
    catalog: null,
    currentStyleId: null,
    order: []
  },

  player: {
    x: 300,
    y: 304,
    targetX: 300,
    dir: 1,
    speed: 82,
    moving: false,
    frame: 0,
    frameTimer: 0
  },

  sprites: { father: new Image() },

  npcAnim: {
    config: null,
    sheets: {},
    frame: 0,
    timer: 0,
    fps: 5
  },

  npcLayouts: {
    config: null
  },

  inventory: [],
  selectedItem: null,
  flags: {
    talkedOlder: false,
    talkedYounger: false,
    treeMarked: false,
    fireStoked: false,
    lanternLit: false,
    questMainDone: false
  },

  dialogue: {
    active: false,
    id: null,
    nodeId: null,
    visibleChoices: [],
    visited: {}
  },

  hover: null,
  pendingHotspot: null,
  debug: false,

  chapters: {
    index: null,
    manifests: [],
    byId: {},
    activeId: null,
    viewId: null,
    panelMode: 'expanded'
  }
};

state.sprites.father.src = 'assets/sprites/father_walk.png';

const AudioBus = {
  ctx: null,
  ambientNode: null,
  ambientGain: null,
  ambientOn: false,

  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },

  resume() {
    const c = this.ensure();
    if (c.state === 'suspended') c.resume();
  },

  tone(freq = 440, dur = 0.06, vol = 0.03, type = 'square') {
    const c = this.ensure();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  },

  play(name) {
    switch (name) {
      case 'pickup':
        this.tone(520, 0.04, 0.025);
        break;
      case 'transition':
        this.tone(220, 0.05, 0.02);
        setTimeout(() => this.tone(160, 0.08, 0.02), 40);
        break;
      case 'warmth':
        this.tone(140, 0.12, 0.04);
        break;
      case 'match':
        this.tone(500, 0.08, 0.03);
        break;
      case 'light':
        this.tone(620, 0.08, 0.03);
        break;
      case 'quest':
        this.tone(740, 0.10, 0.04);
        setTimeout(() => this.tone(880, 0.12, 0.04), 120);
        break;
      default:
        this.tone(320, 0.03, 0.02);
    }
  },

  startAmbient() {
    if (this.ambientOn) return;
    const c = this.ensure();

    this.ambientGain = c.createGain();
    this.ambientGain.gain.value = 0.006;
    this.ambientGain.connect(c.destination);

    const src = c.createBufferSource();
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.2;

    src.buffer = buf;
    src.loop = true;
    src.connect(this.ambientGain);
    src.start();

    this.ambientNode = src;
    this.ambientOn = true;
  }
};

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setMsg(text) {
  elMsg.textContent = text;
}

function getCurrentScene() {
  return state.scenes[state.currentSceneId];
}

function inRect(x, y, rect) {
  const [rx, ry, rw, rh] = rect;
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

function rectArea(rect) {
  return Math.max(0, rect?.[2] || 0) * Math.max(0, rect?.[3] || 0);
}

function pickBestByRect(items, x, y) {
  const hits = (items || []).filter(it => Array.isArray(it.rect) && inRect(x, y, it.rect));
  if (!hits.length) return null;
  hits.sort((a, b) => rectArea(a.rect) - rectArea(b.rect));
  return hits[0];
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isWalkable(x, y, scene) {
  if (!scene?.walkable) return false;

  if (scene.walkable.type === 'rect') {
    const { x: rx, y: ry, w, h } = scene.walkable;
    return x >= rx && x <= rx + w && y >= ry && y <= ry + h;
  }

  if (scene.walkable.type === 'polygon' && Array.isArray(scene.walkable.points)) {
    return pointInPolygon(x, y, scene.walkable.points);
  }

  return false;
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

async function loadJsonSafe(path, fallback = null) {
  try {
    return await loadJson(path);
  } catch {
    return fallback;
  }
}

async function loadChapterManifests() {
  const chapterDir = './data/chapters';
  const index = await loadJsonSafe(`${chapterDir}/CHAPTER_INDEX.json`, null);
  const fallbackEntries = [
    { id: 'chapter1', file: 'chapter1.json' },
    { id: 'chapter2', file: 'chapter2.json' },
    { id: 'chapter3', file: 'chapter3.json' }
  ];
  const entries = Array.isArray(index?.chapters) && index.chapters.length ? index.chapters : fallbackEntries;

  const loaded = [];
  for (const entry of entries) {
    const file = entry.file || `${entry.id}.json`;
    const data = await loadJsonSafe(`${chapterDir}/${file}`, null);
    if (!data) continue;
    loaded.push({
      id: data.id || entry.id || file.replace(/\.json$/i, ''),
      title: data.title || entry.id || 'Untitled chapter',
      objectiveSummary: data.objectiveSummary || '',
      unlockFlags: Array.isArray(data.unlockFlags) ? data.unlockFlags : [],
      scenes: Array.isArray(data.scenes) ? data.scenes : []
    });
  }

  state.chapters.index = index;
  state.chapters.manifests = loaded;
  state.chapters.byId = Object.fromEntries(loaded.map(ch => [ch.id, ch]));
  state.chapters.activeId = inferActiveChapterId();
  state.chapters.viewId = state.chapters.activeId;
}

function sceneBackgroundPool(scene) {
  const style = currentStyle();
  if (style?.sceneArt?.[scene.id]) {
    const sceneAll = Array.isArray(scene.backgrounds) && scene.backgrounds.length
      ? scene.backgrounds
      : (scene.background ? [scene.background] : []);
    const stylePool = style.sceneArt[scene.id].filter(p => sceneAll.includes(p));
    if (stylePool.length) return stylePool;
  }

  if (Array.isArray(scene.backgrounds) && scene.backgrounds.length) return scene.backgrounds;
  if (scene.background) return [scene.background];
  return [];
}

function preloadBg(path) {
  if (state.bgCache.has(path)) return Promise.resolve(state.bgCache.get(path));
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      state.bgCache.set(path, img);
      resolve(img);
    };
    img.src = path;
  });
}

function chooseSceneArt(sceneId, forcePath = null) {
  const scene = state.scenes[sceneId];
  if (!scene) return;
  const pool = sceneBackgroundPool(scene);
  if (!pool.length) return;
  state.sceneBgPath[sceneId] = (forcePath && pool.includes(forcePath)) ? forcePath : rand(pool);
}

function normalizeSceneBgPath(candidate) {
  const out = {};
  for (const sceneId of Object.keys(state.scenes)) {
    const pool = sceneBackgroundPool(state.scenes[sceneId]);
    const cur = candidate?.[sceneId];
    out[sceneId] = pool.includes(cur) ? cur : (state.sceneBgPath[sceneId] || pool[0]);
  }
  return out;
}

function rerollArt() {
  for (const sceneId of Object.keys(state.scenes)) chooseSceneArt(sceneId);
  setMsg(`Art rerolled for style: ${styleLabel()}.`);
  updateStatus();
  saveLocal();
}

function currentBgPath(scene) {
  return state.sceneBgPath[scene.id] || scene.background || sceneBackgroundPool(scene)[0];
}

function itemName(itemId) {
  return state.items[itemId]?.name || itemId;
}

function basename(path) {
  return String(path || '').split('/').pop() || 'n/a';
}

function styleById(id) {
  const list = state.styles.catalog?.styles || [];
  return list.find(s => s.id === id) || null;
}

function currentStyle() {
  return styleById(state.styles.currentStyleId);
}

function styleLabel() {
  return currentStyle()?.label || state.styles.currentStyleId || 'none';
}

function applyNpcSheetsFromStyle(style) {
  const fallbackSheets = state.npcAnim.config?.npcAnimations?.sheets || {};
  const styleSheets = { ...fallbackSheets, ...(style?.npc?.sheets || {}) };
  const fps = style?.npc?.fps || state.npcAnim.config?.npcAnimations?.defaultFps || 5;

  state.npcAnim.sheets = {};
  state.npcAnim.fps = fps;

  for (const [key, relPath] of Object.entries(styleSheets)) {
    const img = new Image();
    img.src = relPath;
    state.npcAnim.sheets[key] = img;
  }
}

function populateStyleSelector() {
  if (!elStyleSelect) return;
  elStyleSelect.innerHTML = '';

  for (const styleId of state.styles.order) {
    const style = styleById(styleId);
    if (!style) continue;
    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = `${style.label} (${style.id})`;
    elStyleSelect.appendChild(opt);
  }

  if (state.styles.currentStyleId) elStyleSelect.value = state.styles.currentStyleId;
}

function applyStyle(styleId, opts = {}) {
  const { silent = false, forceReroll = true } = opts;
  const style = styleById(styleId);
  if (!style) return;

  state.styles.currentStyleId = style.id;
  applyNpcSheetsFromStyle(style);

  if (forceReroll) {
    for (const sceneId of Object.keys(state.scenes)) chooseSceneArt(sceneId);
  }

  if (elStyleSelect) elStyleSelect.value = style.id;
  if (!silent) setMsg(`Style set: ${style.label}`);

  updateStatus();
  saveLocal();
}

function cycleStyle() {
  if (!state.styles.order.length) return;
  const idx = state.styles.order.indexOf(state.styles.currentStyleId);
  const next = state.styles.order[(idx + 1 + state.styles.order.length) % state.styles.order.length];
  applyStyle(next);
}

function allDialogueIds() {
  return Object.keys(state.dialogues || {}).sort();
}

function populateDialogueSelector() {
  if (!elDialogueSelect) return;
  const previous = elDialogueSelect.value;
  const ids = allDialogueIds();

  elDialogueSelect.innerHTML = '';
  for (const id of ids) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    elDialogueSelect.appendChild(opt);
  }

  if (ids.length === 0) return;
  const nextValue = ids.includes(previous) ? previous : ids[0];
  elDialogueSelect.value = nextValue;
}

function startSelectedDialogue() {
  if (!elDialogueSelect?.value) return;
  startDialogue(elDialogueSelect.value);
}

function startRandomDialogue() {
  const ids = allDialogueIds();
  if (!ids.length) return;
  const pick = rand(ids);
  startDialogue(pick);
  if (elDialogueSelect) elDialogueSelect.value = pick;
}

function getChapterById(id) {
  return state.chapters.byId?.[id] || null;
}

function inferActiveChapterId() {
  const sceneId = state.currentSceneId;
  const list = state.chapters.manifests || [];
  const byScene = list.find(ch => Array.isArray(ch.scenes) && ch.scenes.includes(sceneId));
  return byScene?.id || list[0]?.id || null;
}

function ensureChapterPointers() {
  if (!state.chapters.manifests.length) {
    state.chapters.activeId = null;
    state.chapters.viewId = null;
    return;
  }
  if (!state.chapters.activeId || !getChapterById(state.chapters.activeId)) {
    state.chapters.activeId = inferActiveChapterId();
  }
  if (!state.chapters.viewId || !getChapterById(state.chapters.viewId)) {
    state.chapters.viewId = state.chapters.activeId;
  }
}

function chapterFlagRows(chapter) {
  const flags = Array.isArray(chapter?.unlockFlags) ? chapter.unlockFlags : [];
  if (!flags.length) return [{ label: 'No unlock flags', met: true }];
  return flags.map(flag => ({ label: flag, met: !!state.flags?.[flag] }));
}

function renderChapterPanel() {
  if (!elChapterPanel || !elChapterTitle || !elChapterObjective || !elChapterFlags) return;

  ensureChapterPointers();

  const hasChapters = state.chapters.manifests.length > 0;
  if (!hasChapters) {
    elChapterPanel.classList.remove('chapterPanel--collapsed');
    elChapterPanel.classList.add('chapterPanel--expanded');
    elChapterTitle.textContent = 'Chapter: unavailable';
    elChapterObjective.textContent = 'Objective: chapter manifests not found.';
    elChapterFlags.textContent = 'Unlocks: n/a';
    return;
  }

  const viewed = getChapterById(state.chapters.viewId) || state.chapters.manifests[0];
  const active = getChapterById(state.chapters.activeId) || viewed;
  const modeClass = state.chapters.panelMode === 'collapsed' ? 'chapterPanel--collapsed' : 'chapterPanel--expanded';
  const otherClass = state.chapters.panelMode === 'collapsed' ? 'chapterPanel--expanded' : 'chapterPanel--collapsed';
  elChapterPanel.classList.remove(otherClass);
  elChapterPanel.classList.add(modeClass);

  const debugSuffix = state.debug && viewed.id !== active.id ? ` (viewing ${viewed.id}, active ${active.id})` : '';
  elChapterTitle.textContent = `Chapter: ${viewed.title || viewed.id}${debugSuffix}`;
  elChapterObjective.textContent = `Objective: ${viewed.objectiveSummary || 'No objective summary.'}`;

  const rows = chapterFlagRows(viewed);
  elChapterFlags.textContent = '';
  const prefix = document.createElement('div');
  prefix.textContent = 'Unlocks:';
  elChapterFlags.appendChild(prefix);
  const list = document.createElement('div');
  list.className = 'chapterFlagsList';
  rows.forEach(row => {
    const chip = document.createElement('span');
    chip.className = `chapterFlag ${row.met ? 'chapterFlag--met' : 'chapterFlag--missing'}`;
    chip.textContent = `${row.met ? '✓' : '✗'} ${row.label}`;
    list.appendChild(chip);
  });
  elChapterFlags.appendChild(list);
}

function cycleChapterPanelMode() {
  state.chapters.panelMode = state.chapters.panelMode === 'expanded' ? 'collapsed' : 'expanded';
  renderChapterPanel();
}

function shiftChapterView(step) {
  const list = state.chapters.manifests || [];
  if (!list.length) return;
  const current = Math.max(0, list.findIndex(ch => ch.id === state.chapters.viewId));
  const next = (current + step + list.length) % list.length;
  state.chapters.viewId = list[next].id;
  renderChapterPanel();
}

function updateStatus() {
  const inv = state.inventory.map(itemName).join(', ') || 'empty';
  const sel = state.selectedItem ? itemName(state.selectedItem) : 'none';
  const scene = getCurrentScene();
  const art = scene ? basename(currentBgPath(scene)) : 'n/a';
  elStatus.textContent = `Scene: ${state.currentSceneId} | Style: ${styleLabel()} | Art: ${art} | Inventory: ${inv} | Selected: ${sel} | Convos: ${allDialogueIds().length} | Dialogue: ${state.dialogue.active ? 'on' : 'off'} | Debug: ${state.debug ? 'on' : 'off'} | Keys: C=chapter panel, R=reroll, S=next style, G=random dialogue, D=debug, 1-9=dialogue choices`;
  renderChapterPanel();
}

function hasItem(item) {
  return state.inventory.includes(item);
}

function flagEquals(flag, value) {
  return !!state.flags[flag] === !!value;
}

function evalCond(cond) {
  if (!cond) return true;
  if (cond.op === 'hasItem') return hasItem(cond.item);
  if (cond.op === 'flagEquals') return flagEquals(cond.flag, cond.value);
  if (cond.op === 'sceneIs') return state.currentSceneId === cond.scene;
  if (cond.op === 'not') return !evalCond(cond.cond);
  return false;
}

function evalAll(conditions = []) {
  return conditions.every(evalCond);
}

function getConversation(id) {
  return state.dialogues[id] || null;
}

function closeDialogue() {
  state.dialogue.active = false;
  state.dialogue.id = null;
  state.dialogue.nodeId = null;
  state.dialogue.visibleChoices = [];
  state.dialogue.visited = {};
  renderDialogue();
  updateStatus();
}

function currentDialogueNode() {
  if (!state.dialogue.active) return null;
  const convo = getConversation(state.dialogue.id);
  if (!convo) return null;
  return convo.nodes?.[state.dialogue.nodeId] || null;
}

function enterDialogueNode(nodeId) {
  const convo = getConversation(state.dialogue.id);
  if (!convo) {
    closeDialogue();
    return;
  }
  const node = convo.nodes?.[nodeId];
  if (!node) {
    closeDialogue();
    return;
  }

  state.dialogue.nodeId = nodeId;
  const visitKey = `${state.dialogue.id}:${nodeId}`;
  if (!state.dialogue.visited[visitKey]) {
    executeBlock(node.actions || []);
    state.dialogue.visited[visitKey] = true;
    runQuestChecks();
  }
}

function startDialogue(dialogueId) {
  const convo = getConversation(dialogueId);
  if (!convo) {
    setMsg(`Missing dialogue: ${dialogueId}`);
    return;
  }
  state.dialogue.active = true;
  state.dialogue.id = dialogueId;
  if (elDialogueSelect) elDialogueSelect.value = dialogueId;
  state.dialogue.nodeId = convo.start;
  state.dialogue.visibleChoices = [];
  state.dialogue.visited = {};

  enterDialogueNode(convo.start);
  renderDialogue();
  updateStatus();
}

function pickDialogueChoice(index) {
  if (!state.dialogue.active) return;
  const choice = state.dialogue.visibleChoices[index];
  if (!choice) return;

  executeBlock(choice.actions || []);
  runQuestChecks();

  if (choice.next) {
    enterDialogueNode(choice.next);
    renderDialogue();
  } else {
    closeDialogue();
  }

  saveLocal();
}

function renderDialogue() {
  if (!state.dialogue.active) {
    elDialogue.classList.add('hidden');
    elDlgSpeaker.textContent = '';
    elDlgLine.textContent = '';
    elDlgChoices.innerHTML = '';
    return;
  }

  const node = currentDialogueNode();
  if (!node) {
    closeDialogue();
    return;
  }

  elDialogue.classList.remove('hidden');
  elDlgSpeaker.textContent = node.speaker || '...';
  elDlgLine.textContent = node.line || '';
  elDlgChoices.innerHTML = '';

  const choices = (node.choices || []).filter(c => !c.if || evalAll(c.if));

  if (choices.length > 0) {
    state.dialogue.visibleChoices = choices;
    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dlgChoiceBtn';
      btn.textContent = `${idx + 1}. ${choice.text}`;
      btn.addEventListener('click', () => pickDialogueChoice(idx));
      elDlgChoices.appendChild(btn);
    });
    return;
  }

  const autoChoice = {
    text: node.next ? 'Continue' : 'End',
    next: node.next || null,
    actions: []
  };
  state.dialogue.visibleChoices = [autoChoice];

  const btn = document.createElement('button');
  btn.className = 'dlgChoiceBtn';
  btn.textContent = `1. ${autoChoice.text}`;
  btn.addEventListener('click', () => pickDialogueChoice(0));
  elDlgChoices.appendChild(btn);
}

function executeAction(action) {
  if (!action) return;

  switch (action.type) {
    case 'showText':
      setMsg(action.text || '...');
      break;

    case 'giveItem':
      if (!hasItem(action.item)) state.inventory.push(action.item);
      updateStatus();
      break;

    case 'removeItem':
      state.inventory = state.inventory.filter(i => i !== action.item);
      if (state.selectedItem === action.item) state.selectedItem = null;
      updateStatus();
      break;

    case 'setFlag':
      state.flags[action.flag] = action.value;
      break;

    case 'gotoScene': {
      const target = state.scenes[action.scene];
      if (!target) return;
      state.currentSceneId = action.scene;
      state.player.x = state.player.targetX = target.spawn.x;
      state.player.y = target.spawn.y;
      state.selectedItem = null;
      state.pendingHotspot = null;
      if (action.text) setMsg(action.text);
      closeDialogue();
      updateStatus();
      break;
    }

    case 'playSfx':
      AudioBus.play(action.name);
      break;

    case 'rerollArt':
      if (action.scene && state.scenes[action.scene]) chooseSceneArt(action.scene);
      else rerollArt();
      updateStatus();
      break;

    case 'startDialogue':
      startDialogue(action.id);
      break;

    case 'endDialogue':
      closeDialogue();
      break;

    default:
      break;
  }
}

function executeBlock(block = []) {
  for (const step of block) {
    if (step.if) {
      if (evalAll(step.if)) executeBlock(step.then || []);
      else executeBlock(step.else || []);
    } else {
      executeAction(step);
    }
  }
}

function runQuestChecks() {
  for (const check of state.events.questChecks || []) {
    if (evalAll(check.if || [])) executeBlock(check.then || []);
  }
  state.chapters.activeId = inferActiveChapterId();
  if (!state.debug) state.chapters.viewId = state.chapters.activeId;
  renderChapterPanel();
}

function runInteraction(kind, key) {
  const node = state.events[kind]?.[key];
  if (!node) return false;
  executeBlock(node.onClick || []);
  runQuestChecks();
  return true;
}

function runUseRule(itemId, sceneId, hotspotId) {
  const key = `${itemId}|${sceneId}:${hotspotId}`;
  const rule = state.events.useRules?.[key];
  if (!rule) return false;
  executeBlock(rule);
  runQuestChecks();
  return true;
}

function actionBlockHasGoto(block = []) {
  for (const step of block) {
    if (!step || typeof step !== 'object') continue;
    if (step.type === 'gotoScene') return true;
    if (Array.isArray(step.then) && actionBlockHasGoto(step.then)) return true;
    if (Array.isArray(step.else) && actionBlockHasGoto(step.else)) return true;
  }
  return false;
}

function hotspotTriggersSceneTransition(sceneId, hs) {
  if (!hs?.id) return false;

  if (typeof hs.action === 'string' && hs.action.startsWith('goto:')) return true;

  const node = state.events.hotspots?.[`${sceneId}:${hs.id}`];
  if (!node) return false;
  return actionBlockHasGoto(node.onClick || []);
}

function queueTransitionApproach(scene, hs) {
  const centerX = Math.round(hs.rect[0] + hs.rect[2] / 2);
  let approachX = Number.isFinite(hs.approachX) ? hs.approachX : centerX;

  if (scene.walkable?.type === 'rect') {
    const minX = scene.walkable.x + 4;
    const maxX = scene.walkable.x + scene.walkable.w - 4;
    approachX = Math.max(minX, Math.min(maxX, approachX));
  } else {
    approachX = Math.max(24, Math.min(616, approachX));
  }

  state.pendingHotspot = { sceneId: scene.id, hotspotId: hs.id };
  state.player.targetX = approachX;
  state.player.dir = state.player.targetX >= state.player.x ? 1 : -1;

  const dist = Math.abs(state.player.targetX - state.player.x);
  state.player.moving = dist > 1;

  if (!state.player.moving) {
    triggerPendingHotspot();
  } else {
    setMsg(hs.walkToText || `You move toward ${String(hs.id).replace(/_/g, ' ')}.`);
  }
}

function triggerPendingHotspot() {
  const pending = state.pendingHotspot;
  if (!pending) return;
  state.pendingHotspot = null;

  const scene = getCurrentScene();
  if (!scene || scene.id !== pending.sceneId) return;

  const hs = (scene.hotspots || []).find(h => h.id === pending.hotspotId);
  if (!hs) return;

  if (runInteraction('hotspots', `${scene.id}:${hs.id}`)) {
    saveLocal();
    return;
  }

  if (hs.text) setMsg(hs.text);
  saveLocal();
}

function resolveHoverTarget(x, y) {
  if (y >= UI_Y || state.dialogue.active) return null;
  const scene = getCurrentScene();

  const hs = pickBestByRect(scene.hotspots || [], x, y);
  if (hs) return { kind: 'hotspot', id: hs.id, rect: hs.rect };

  const npc = pickBestByRect(scene.npcs || [], x, y);
  if (npc) return { kind: 'entity', id: npc.id, rect: npc.rect };

  return null;
}

function drawItemIcon(itemId, x, y) {
  if (itemId === 'notebook') {
    ctx.fillStyle = '#b8aa8d';
    ctx.fillRect(x + 6, y + 8, 22, 16);
    ctx.strokeStyle = '#3a2f24';
    ctx.strokeRect(x + 6, y + 8, 22, 16);
    ctx.strokeStyle = '#6a5a40';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 12); ctx.lineTo(x + 24, y + 12);
    ctx.moveTo(x + 10, y + 16); ctx.lineTo(x + 24, y + 16);
    ctx.stroke();
    return;
  }

  if (itemId === 'dry_wood') {
    ctx.strokeStyle = '#8a6a43';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 22); ctx.lineTo(x + 28, y + 8);
    ctx.moveTo(x + 9, y + 25); ctx.lineTo(x + 31, y + 12);
    ctx.stroke();
    ctx.lineWidth = 1;
    return;
  }

  ctx.fillStyle = '#9d8e7d';
  ctx.fillRect(x + 10, y + 10, 12, 12);
}



function getSceneNpc(scene, npcId) {
  return (scene?.npcs || []).find(n => n.id === npcId) || null;
}

function getNpcLayout(scene, npcId, animState = 'idle') {
  const sceneLayouts = state.npcLayouts.config?.scenes?.[scene.id];
  const npcLayout = sceneLayouts?.[npcId];
  const stateLayout = npcLayout?.states?.[animState] || npcLayout?.states?.idle || null;
  if (stateLayout) return stateLayout;

  const sceneNpc = getSceneNpc(scene, npcId);
  const sceneStateLayout = sceneNpc?.visual?.states?.[animState] || sceneNpc?.visual?.states?.idle || null;
  if (sceneStateLayout) return sceneStateLayout;

  if (scene.id === 'cabin' && npcId === 'younger') return { x: 60, y: 198, w: 96, h: 96 };
  if (scene.id === 'cabin' && npcId === 'older') return { x: 430, y: 198, w: 96, h: 96 };

  return null;
}

function drawNpcSprites(scene) {
  if (scene.id !== 'cabin') return;

  const cfg = state.npcAnim.config?.npcAnimations;
  const activeNode = state.dialogue.active ? currentDialogueNode() : null;
  const speaker = String(activeNode?.speaker || '').toLowerCase();
  const olderSpeaking = speaker.includes('older');
  const youngerSpeaking = speaker.includes('younger');

  if (!cfg) {
    // fallback silhouettes
    const t = Math.sin(performance.now() / 300) * 2;
    ctx.fillStyle = '#2f241b';
    ctx.fillRect(95, 220 + t, 22, 70);
    ctx.fillRect(88, 205 + t, 36, 16);
    ctx.fillStyle = '#3b2d22';
    ctx.fillRect(468, 236, 34, 50);
    ctx.fillRect(452, 220, 52, 20);
    return;
  }

  const fw = cfg.frameWidth || 96;
  const fh = cfg.frameHeight || 96;
  const frameCount = cfg.frameCount || 4;
  const frame = state.npcAnim.frame % frameCount;

  const youngerState = youngerSpeaking ? 'talk' : 'idle';
  const olderState = olderSpeaking ? 'talk' : 'idle';

  const youngerKey = (youngerSpeaking && state.npcAnim.sheets['younger_talk']) ? 'younger_talk' : 'younger_idle';
  const olderKey = (olderSpeaking && state.npcAnim.sheets['older_talk']) ? 'older_talk' : 'older_idle';

  const youngerImg = state.npcAnim.sheets[youngerKey];
  const olderImg = state.npcAnim.sheets[olderKey];

  const youngerLayout = getNpcLayout(scene, 'younger', youngerState);
  const olderLayout = getNpcLayout(scene, 'older', olderState);

  if (youngerImg?.complete && youngerLayout) {
    const bobBase = youngerLayout.bobScale ?? (youngerSpeaking ? 2.4 : 1.5);
    const bob = Math.sin(performance.now() / 280) * bobBase;
    const sx = frame * fw;
    ctx.drawImage(
      youngerImg,
      sx,
      0,
      fw,
      fh,
      youngerLayout.x,
      youngerLayout.y + bob,
      youngerLayout.w || 96,
      youngerLayout.h || 96
    );
  }

  if (olderImg?.complete && olderLayout) {
    const bobBase = olderLayout.bobScale ?? (olderSpeaking ? 2.0 : 1.2);
    const bob = Math.sin((performance.now() + 120) / 300) * bobBase;
    const sx = frame * fw;
    ctx.drawImage(
      olderImg,
      sx,
      0,
      fw,
      fh,
      olderLayout.x,
      olderLayout.y + bob,
      olderLayout.w || 96,
      olderLayout.h || 96
    );
  }
}

function drawPlayer() {
  const img = state.sprites.father;
  if (!img.complete) return;

  const p = state.player;
  const sw = 128, sh = 128, sx = p.frame * sw, sy = 0;
  const dw = 96, dh = 96, dx = p.x - dw / 2, dy = p.y - dh;

  ctx.save();
  if (p.dir < 0) {
    ctx.translate(dx + dw / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, dy, dw, dh);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ctx.restore();
}

function drawInventory() {
  ctx.fillStyle = '#120e0a';
  ctx.fillRect(0, UI_Y, W, H - UI_Y);
  ctx.strokeStyle = '#3a2f24';
  ctx.strokeRect(0, UI_Y, W, H - UI_Y);

  const slots = Math.max(5, state.inventory.length + 1);
  const slotW = Math.floor(W / slots);

  for (let i = 0; i < slots; i++) {
    const x = i * slotW;
    ctx.strokeStyle = '#4f3f30';
    ctx.strokeRect(x + 2, UI_Y + 6, slotW - 4, 48);

    if (i < state.inventory.length) {
      const id = state.inventory[i];
      if (state.selectedItem === id) {
        ctx.fillStyle = '#3d2f21';
        ctx.fillRect(x + 3, UI_Y + 7, slotW - 6, 46);
      }
      drawItemIcon(id, x + 8, UI_Y + 6);
      ctx.fillStyle = '#d8c9b8';
      ctx.font = '11px monospace';
      ctx.fillText(itemName(id), x + 6, UI_Y + 50);
    }
  }

  ctx.fillStyle = '#9d8e7d';
  ctx.font = '12px monospace';
  ctx.fillText('engine v1.0', W - 98, UI_Y + 16);
}

function drawDebug(scene) {
  if (!state.debug) return;

  ctx.save();
  ctx.globalAlpha = 0.35;

  if (scene.walkable?.type === 'rect') {
    const w = scene.walkable;
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }

  if (scene.walkable?.type === 'polygon' && Array.isArray(scene.walkable.points)) {
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    scene.walkable.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.fill();
  }

  for (const hs of scene.hotspots || []) {
    const [x, y, w, h] = hs.rect;
    ctx.fillStyle = '#f9a825';
    ctx.fillRect(x, y, w, h);
  }

  for (const npc of scene.npcs || []) {
    const [x, y, w, h] = npc.rect;
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();

  ctx.save();
  ctx.font = '10px monospace';

  for (const hs of scene.hotspots || []) {
    const [x, y] = hs.rect;
    ctx.fillStyle = '#f9a825';
    ctx.fillText(`hs:${hs.id}`, x + 2, y + 12);
  }

  for (const npc of scene.npcs || []) {
    const [x, y] = npc.rect;
    ctx.fillStyle = '#64b5f6';
    ctx.fillText(`npc:${npc.id}`, x + 2, y + 12);
  }

  if (state.hover) {
    const [x, y, w, h] = state.hover.rect;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`hover:${state.hover.kind}:${state.hover.id}`, x + 2, Math.max(10, y - 2));
  }

  ctx.restore();
}

function drawHints(scene) {
  if (scene.id === 'cabin' && !hasItem('notebook')) {
    ctx.fillStyle = '#ceb98f';
    ctx.fillRect(360, 238, 28, 18);
    ctx.strokeStyle = '#3f311f';
    ctx.strokeRect(360, 238, 28, 18);
  }

  if (scene.id === 'forest' && !hasItem('dry_wood')) {
    ctx.strokeStyle = '#8a6a43';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(195, 285); ctx.lineTo(225, 255);
    ctx.moveTo(205, 289); ctx.lineTo(235, 261);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  if (state.hover) {
    const [x, y, w, h] = state.hover.rect;
    ctx.strokeStyle = '#d8c9b8';
    ctx.strokeRect(x, y, w, h);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const scene = getCurrentScene();
  const bgPath = currentBgPath(scene);
  const bg = state.bgCache.get(bgPath);
  if (bg) ctx.drawImage(bg, 0, 0, W, SCENE_H);

  drawNpcSprites(scene);

  drawHints(scene);
  drawPlayer();
  drawDebug(scene);
  drawInventory();
}

function update(dt) {
  // npc idle animation clock
  state.npcAnim.timer += dt;
  if (state.npcAnim.timer >= (1 / Math.max(1, state.npcAnim.fps))) {
    state.npcAnim.timer = 0;
    const frameCount = state.npcAnim.config?.npcAnimations?.frameCount || 4;
    state.npcAnim.frame = (state.npcAnim.frame + 1) % frameCount;
  }

  const p = state.player;
  if (!p.moving) return;

  const d = p.targetX - p.x;
  const step = Math.sign(d) * p.speed * dt;

  if (Math.abs(step) >= Math.abs(d)) {
    p.x = p.targetX;
    p.moving = false;
    p.frame = 0;
    triggerPendingHotspot();
  } else {
    p.x += step;
    p.frameTimer += dt;
    if (p.frameTimer > 0.12) {
      p.frameTimer = 0;
      p.frame = (p.frame + 1) % 4;
    }
  }
}

function serializeSave() {
  return {
    version: 'engine-v1.0',
    currentSceneId: state.currentSceneId,
    styleId: state.styles.currentStyleId,
    sceneBgPath: state.sceneBgPath,
    player: { x: state.player.x, y: state.player.y },
    inventory: state.inventory,
    selectedItem: state.selectedItem,
    flags: state.flags
  };
}

function applySave(save) {
  if (!save) return;

  if (save.currentSceneId && state.scenes[save.currentSceneId]) {
    state.currentSceneId = save.currentSceneId;
  }

  if (save.styleId && styleById(save.styleId)) {
    applyStyle(save.styleId, { silent: true, forceReroll: false });
  }

  state.sceneBgPath = normalizeSceneBgPath(save.sceneBgPath || state.sceneBgPath);

  state.player.x = save.player?.x ?? state.scenes[state.currentSceneId].spawn.x;
  state.player.y = save.player?.y ?? state.scenes[state.currentSceneId].spawn.y;
  state.player.targetX = state.player.x;

  state.inventory = Array.isArray(save.inventory) ? save.inventory : [];
  state.selectedItem = save.selectedItem ?? null;
  state.flags = { ...state.flags, ...(save.flags || {}) };

  closeDialogue();
  updateStatus();
}

function saveLocal() {
  localStorage.setItem('itw_engine_save', JSON.stringify(serializeSave()));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem('itw_engine_save');
    if (!raw) return;
    applySave(JSON.parse(raw));
    setMsg('Loaded autosave from localStorage.');
  } catch {
    // ignore corrupted local save
  }
}

function handleSceneClick(x, y) {
  if (state.dialogue.active) return;

  const scene = getCurrentScene();

  // 1) UI hit
  if (y >= UI_Y) {
    const slots = Math.max(5, state.inventory.length + 1);
    const slotW = Math.floor(W / slots);

    for (let i = 0; i < state.inventory.length; i++) {
      const sx = i * slotW;
      if (x >= sx && x < sx + slotW) {
        const id = state.inventory[i];
        state.selectedItem = state.selectedItem === id ? null : id;
        setMsg(state.selectedItem ? `Selected ${itemName(id)}` : 'Selection cleared.');
        AudioBus.play('default');
        updateStatus();
      }
    }
    return;
  }

  // 2) hotspot hit (prefer smallest overlapping rect)
  const hs = pickBestByRect(scene.hotspots || [], x, y);
  if (hs) {
    if (state.selectedItem && runUseRule(state.selectedItem, scene.id, hs.id)) {
      state.pendingHotspot = null;
      saveLocal();
      return;
    }

    if (hotspotTriggersSceneTransition(scene.id, hs)) {
      queueTransitionApproach(scene, hs);
      saveLocal();
      return;
    }

    state.pendingHotspot = null;
    if (runInteraction('hotspots', `${scene.id}:${hs.id}`)) {
      saveLocal();
      return;
    }

    setMsg(hs.text || `You inspect ${hs.id}.`);
    saveLocal();
    return;
  }

  // 3) entity hit (prefer smallest overlapping rect)
  const npc = pickBestByRect(scene.npcs || [], x, y);
  if (npc) {
    state.pendingHotspot = null;
    if (runInteraction('entities', `${scene.id}:${npc.id}`)) {
      saveLocal();
      return;
    }

    setMsg(npc.text || `You talk to ${npc.id}.`);
    saveLocal();
    return;
  }

  // 4) movement command
  if (!isWalkable(x, y, scene)) return;
  state.pendingHotspot = null;
  state.player.targetX = Math.max(24, Math.min(616, x));
  state.player.dir = state.player.targetX >= state.player.x ? 1 : -1;
  state.player.moving = true;
  saveLocal();
}

function setupUi() {
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    state.hover = resolveHoverTarget(x, y);
    canvas.style.cursor = state.hover ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', (e) => {
    AudioBus.resume();
    AudioBus.startAmbient();

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    handleSceneClick(x, y);
  });

  window.addEventListener('keydown', (e) => {
    if (state.dialogue.active) {
      if (e.key === 'Escape') {
        closeDialogue();
        return;
      }
      if (e.key === 'Enter') {
        pickDialogueChoice(0);
        return;
      }
      if (/^[1-9]$/.test(e.key)) {
        pickDialogueChoice(Number(e.key) - 1);
        return;
      }
    }

    if (e.key.toLowerCase() === 'c') cycleChapterPanelMode();
    if (e.key === '[' && state.debug) shiftChapterView(-1);
    if (e.key === ']' && state.debug) shiftChapterView(1);
    if (e.key.toLowerCase() === 'r') rerollArt();
    if (e.key.toLowerCase() === 's') cycleStyle();
    if (e.key.toLowerCase() === 'g') startRandomDialogue();
    if (e.key.toLowerCase() === 'l') startSelectedDialogue();
    if (e.key.toLowerCase() === 'd') {
      state.debug = !state.debug;
      if (!state.debug) state.chapters.viewId = state.chapters.activeId;
      updateStatus();
    }
  });

  document.getElementById('btnReroll').addEventListener('click', () => {
    rerollArt();
  });

  if (elBtnApplyStyle) {
    elBtnApplyStyle.addEventListener('click', () => {
      if (elStyleSelect?.value) applyStyle(elStyleSelect.value);
    });
  }

  if (elBtnCycleStyle) {
    elBtnCycleStyle.addEventListener('click', () => cycleStyle());
  }

  if (elStyleSelect) {
    elStyleSelect.addEventListener('change', () => {
      if (elStyleSelect.value) applyStyle(elStyleSelect.value);
    });
  }

  if (elBtnStartDialogue) {
    elBtnStartDialogue.addEventListener('click', () => startSelectedDialogue());
  }

  if (elBtnRandomDialogue) {
    elBtnRandomDialogue.addEventListener('click', () => startRandomDialogue());
  }

  if (elDialogueSelect) {
    elDialogueSelect.addEventListener('change', () => {
      // keep selection only; start via button or L key
    });
  }

  document.getElementById('btnSave').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(serializeSave(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'savegame.json';
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Downloaded savegame.json');
  });

  document.getElementById('fileLoad').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      applySave(JSON.parse(text));
      saveLocal();
      setMsg('Loaded savegame.json');
    } catch {
      setMsg('Invalid save file');
    }
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    localStorage.removeItem('itw_engine_save');
    location.reload();
  });
}

let last = performance.now();
function loop(t) {
  const dt = Math.min(0.033, (t - last) / 1000);
  last = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

(async function boot() {
  const [
    cabin,
    forest,
    rangerStation,
    moonwellHollow,
    windfallOrchard,
    items,
    events,
    dialogueCabin,
    dialogueForest,
    dialogueNight,
    dialogueFuture,
    dialogueChapter,
    npcAnimCfg,
    npcLayoutsCfg,
    styleCatalog,
    _chaptersLoaded
  ] = await Promise.all([
    loadJson('./data/scenes/cabin.json'),
    loadJson('./data/scenes/forest.json'),
    loadJson('./data/scenes/ranger_station.json').catch(() => null),
    loadJson('./data/scenes/moonwell_hollow.json').catch(() => null),
    loadJson('./data/scenes/windfall_orchard.json').catch(() => null),
    loadJson('./data/items/items.json'),
    loadJson('./data/events/interactions.json'),
    loadJson('./data/dialogue/cabin_dialogue.json').catch(() => null),
    loadJson('./data/dialogue/forest_dialogue.json').catch(() => null),
    loadJson('./data/dialogue/night_dialogue.json').catch(() => null),
    loadJson('./data/dialogue/future_scenes_dialogue.json').catch(() => null),
    loadJson('./data/dialogue/chapter_dialogue.json').catch(() => null),
    loadJson('./data/npc_animations.json').catch(() => null),
    loadJson('./data/npc_layouts.json').catch(() => null),
    loadJson('./data/styles/style_catalog.json').catch(() => null),
    loadChapterManifests()
  ]);

  state.scenes.cabin = cabin;
  state.scenes.forest = forest;
  if (rangerStation) state.scenes.ranger_station = rangerStation;
  if (moonwellHollow) state.scenes.moonwell_hollow = moonwellHollow;
  if (windfallOrchard) state.scenes.windfall_orchard = windfallOrchard;
  state.items = items;
  state.events = events;
  state.dialogues = {
    ...(dialogueCabin?.conversations || {}),
    ...(dialogueForest?.conversations || {}),
    ...(dialogueNight?.conversations || {}),
    ...(dialogueFuture?.conversations || {}),
    ...(dialogueChapter?.conversations || {})
  };
  state.npcAnim.config = npcAnimCfg;
  state.npcLayouts.config = npcLayoutsCfg;

  const defaultNpcSheets = npcAnimCfg?.npcAnimations?.sheets || {
    older_idle: 'assets/sprites/npc/older_idle_4f.png',
    younger_idle: 'assets/sprites/npc/younger_idle_4f.png',
    older_walk: 'assets/sprites/npc/older_walk_4f.png',
    younger_walk: 'assets/sprites/npc/younger_walk_4f.png',
    older_talk: 'assets/sprites/npc/older_talk_4f.png',
    younger_talk: 'assets/sprites/npc/younger_talk_4f.png'
  };

  if (styleCatalog?.styles?.length) {
    state.styles.catalog = styleCatalog;
  } else {
    state.styles.catalog = {
      defaultStyleId: 'fallback',
      styles: [
        {
          id: 'fallback',
          label: 'Fallback',
          description: 'No style catalog found; using all scene art pools.',
          sceneArt: {},
          npc: { fps: 5, sheets: defaultNpcSheets }
        }
      ]
    };
  }

  state.styles.order = (state.styles.catalog.styles || []).map(s => s.id);
  const preferredStyle = state.styles.catalog.defaultStyleId;
  state.styles.currentStyleId = state.styles.order.includes(preferredStyle)
    ? preferredStyle
    : state.styles.order[0];

  populateStyleSelector();
  populateDialogueSelector();
  applyStyle(state.styles.currentStyleId, { silent: true, forceReroll: true });

  // preload all known backgrounds
  const allBg = new Set();
  for (const scene of Object.values(state.scenes)) {
    for (const bg of sceneBackgroundPool(scene)) allBg.add(bg);
  }
  await Promise.all([...allBg].map(preloadBg));

  // preload npc sheets if configured
  const npcSheets = Object.values(state.npcAnim.sheets);
  await Promise.all(npcSheets.map(img => new Promise((resolve) => {
    if (img.complete) return resolve();
    img.onload = () => resolve();
    img.onerror = () => resolve();
  })));

  const spawn = getCurrentScene().spawn;
  state.player.x = state.player.targetX = spawn.x;
  state.player.y = spawn.y;

  setupUi();
  updateStatus();
  renderDialogue();
  loadLocal();
  requestAnimationFrame(loop);
})();
