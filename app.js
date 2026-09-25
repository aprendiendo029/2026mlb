/**
 * Quiniela Béisbol MLB 2026 - Módulo Principal y Gestión de Estado
 * Ubicación física: app.js (Raíz)
 */

import { 
  TEAMS, 
  PARTICIPANTS, 
  STAT_VARS, 
  DEFAULT_SCHEDULE, 
  STORAGE_KEY, 
  DEVICE_ID 
} from "./js/config/constants.js";

import { 
  initFirebaseConnection, 
  sendStateToFirebase,
  deleteCustomGame 
} from "./js/services/firebaseService.js";

import { 
  showToast, 
  openDeleteModal, 
  closeDeleteModal, 
  selectGameForDeletion, 
  renderLeaderboard, 
  renderFilters, 
  renderGames, 
  updateScoreboardValidations,
  getGameCDMXDateStr
} from "./js/ui/render.js";

// Configuración de tema extendido para Tailwind
if (window.tailwind) {
  window.tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        },
        colors: {
          navy: { DEFAULT: '#0a192f', dark: '#030c1a', light: '#1e2d4a' },
          honolulu: { 100: '#e0f0fe', 300: '#7ccbfd', 700: '#075985' },
          bottlegreen: { 100: '#dcfce7', 300: '#86efac', 700: '#166534' }
        }
      }
    }
  };
}

export let SCHEDULE = [...DEFAULT_SCHEDULE];
let saveTimeout = null;

export let appState = {
  official: {},    
  predictions: {}, 
  savedPredictions: {},
  customSchedule: [],
  deletedGames: [],
  closedGames: {},
  selectedDateFilter: 'TODOS',
  selectedZoneFilter: 'TODOS',
  lastUpdated: 0,
  senderId: DEVICE_ID
};

export function syncScheduleList() {
  const custom = Array.isArray(appState.customSchedule) ? appState.customSchedule : [];
  const deleted = Array.isArray(appState.deletedGames) ? appState.deletedGames : [];
  const map = new Map();
  
  DEFAULT_SCHEDULE.forEach(g => {
    const gameId = g.id || g.gameId;
    if (gameId && !deleted.includes(gameId)) {
      map.set(gameId, {
        ...g,
        id: gameId,
        date: getGameCDMXDateStr(g.rawDateTime || g.gameDate || g.date)
      });
    }
  });
  
  custom.forEach(g => {
    const gameId = g.id || g.gameId;
    if (gameId && !deleted.includes(gameId)) {
      map.set(gameId, {
        ...g,
        id: gameId,
        date: getGameCDMXDateStr(g.rawDateTime || g.gameDate || g.date)
      });
    }
  });
  
  SCHEDULE = Array.from(map.values());
  window.SCHEDULE = SCHEDULE;
}

export function initEmptyData() {
  appState.official = {};
  appState.predictions = { gori: {}, mm: {}, tm: {} };
  appState.savedPredictions = {};
  appState.customSchedule = [];
  appState.deletedGames = [];
  appState.closedGames = {};
  appState.selectedDateFilter = 'TODOS';
  appState.selectedZoneFilter = 'TODOS';
  appState.lastUpdated = Date.now();
  appState.senderId = DEVICE_ID;
  
  syncScheduleList();
}

export function initData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appState = JSON.parse(saved);
      if (!appState.selectedZoneFilter) appState.selectedZoneFilter = 'TODOS';
      if (!appState.selectedDateFilter) appState.selectedDateFilter = 'TODOS';
      if (!appState.savedPredictions) appState.savedPredictions = {};
      if (!appState.customSchedule) appState.customSchedule = [];
      if (!appState.deletedGames) appState.deletedGames = [];
      if (!appState.closedGames) appState.closedGames = {};
      appState.senderId = DEVICE_ID;
    } catch (e) {
      initEmptyData();
    }
  } else {
    initEmptyData();
  }
  syncScheduleList();
}

export function applyIncomingState(data) {
  if (!data) return;
  
  if (data.customSchedule && Array.isArray(data.customSchedule)) {
    appState.customSchedule = data.customSchedule;
  }
  if (data.deletedGames && Array.isArray(data.deletedGames)) {
    appState.deletedGames = data.deletedGames;
  }

  syncScheduleList();

  if (!appState.official) appState.official = {};
  SCHEDULE.forEach(game => {
    if (!appState.official[game.id]) {
      appState.official[game.id] = {
        visitorR: '', visitorH: '', visitorE: '', visitorBB: '', visitorHR: '', visitorK: '',
        localR: '', localH: '', localE: '', localBB: '', localHR: '', localK: '',
        winner: ''
      };
    }
  });

  if (data.official && typeof data.official === 'object') {
    Object.keys(data.official).forEach(gameId => {
      if (data.official[gameId] && typeof data.official[gameId] === 'object') {
        appState.official[gameId] = {
          ...(appState.official[gameId] || {}),
          ...data.official[gameId]
        };
      }
    });
  }

  if (data.predictions && typeof data.predictions === 'object') {
    if (!appState.predictions) appState.predictions = {};
    Object.keys(data.predictions).forEach(pId => {
      if (!appState.predictions[pId]) appState.predictions[pId] = {};
      if (data.predictions[pId] && typeof data.predictions[pId] === 'object') {
        Object.keys(data.predictions[pId]).forEach(gameId => {
          if (data.predictions[pId][gameId] && typeof data.predictions[pId][gameId] === 'object') {
            appState.predictions[pId][gameId] = {
              ...(appState.predictions[pId][gameId] || {}),
              ...data.predictions[pId][gameId]
            };
          }
        });
      }
    });
  }

  if (data.savedPredictions && typeof data.savedPredictions === 'object') {
    if (!appState.savedPredictions) appState.savedPredictions = {};
    Object.keys(data.savedPredictions).forEach(gameId => {
      if (data.savedPredictions[gameId] && typeof data.savedPredictions[gameId] === 'object') {
        appState.savedPredictions[gameId] = {
          ...(appState.savedPredictions[gameId] || {}),
          ...data.savedPredictions[gameId]
        };
      }
    });
  }

  if (data.closedGames && typeof data.closedGames === 'object') {
    appState.closedGames = data.closedGames;
  }

  appState.lastUpdated = data.lastUpdated || Date.now();
  window.appState = appState;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  renderLeaderboard(appState, SCHEDULE);
  renderFilters(appState, SCHEDULE);
  renderGames(appState, SCHEDULE, window.selectedGameIdToDelete);
  updateScoreboardValidations(appState, SCHEDULE);
}

export function autoSaveDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    sendStateToFirebase(appState);
  }, 350);
}

export function onStatInputChange(gameId, targetType, fieldKey, rawValue) {
  const val = rawValue.trim();

  if (targetType === 'official') {
    if (!appState.official[gameId]) appState.official[gameId] = {};
    appState.official[gameId][fieldKey] = val;
  } else {
    if (!appState.predictions[targetType]) appState.predictions[targetType] = {};
    if (!appState.predictions[targetType][gameId]) appState.predictions[targetType][gameId] = {};
    appState.predictions[targetType][gameId][fieldKey] = val;
  }

  appState.lastUpdated = Date.now();
  appState.senderId = DEVICE_ID;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));

  renderLeaderboard(appState, SCHEDULE);
  updateScoreboardValidations(appState, SCHEDULE);
  autoSaveDebounced();
}

export function saveParticipantPrediction(gameId, participantId) {
  if (!appState.savedPredictions) appState.savedPredictions = {};
  if (!appState.savedPredictions[gameId]) appState.savedPredictions[gameId] = {};

  appState.savedPredictions[gameId][participantId] = true;
  appState.lastUpdated = Date.now();
  appState.senderId = DEVICE_ID;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  
  sendStateToFirebase(appState);
  showToast(`Pronóstico de ${participantId.toUpperCase()} guardado correctamente.`, "success");
  
  renderAll();
}

export async function deleteGameFromUI() {
  const targetId = window.selectedGameIdToDelete || window.pendingGameToDeleteId;
  if (!targetId) {
    showToast("Selecciona una pizarra haciendo clic en 'Borrar pizarra' primero.", "error");
    return;
  }
  openDeleteModal(targetId);
}

export async function executeDeleteGame() {
  const targetId = window.pendingGameToDeleteId || window.selectedGameIdToDelete;
  if (!targetId) {
    closeDeleteModal();
    return;
  }

  const targetGame = SCHEDULE.find(g => g.id === targetId);
  const targetVisitor = targetGame ? (targetGame.visitor || targetGame.awayTeam) : '';
  const targetLocal = targetGame ? (targetGame.local || targetGame.homeTeam) : '';

  await deleteCustomGame(targetId);

  if (!appState.deletedGames) appState.deletedGames = [];
  if (!appState.deletedGames.includes(targetId)) {
    appState.deletedGames.push(targetId);
  }

  if (appState.customSchedule) {
    appState.customSchedule = appState.customSchedule.filter(g => (g.id || g.gameId) !== targetId);
  }
  if (appState.official?.[targetId]) delete appState.official[targetId];
  if (appState.savedPredictions?.[targetId]) delete appState.savedPredictions[targetId];
  if (appState.closedGames?.[targetId]) delete appState.closedGames[targetId];

  window.selectedGameIdToDelete = null;
  window.pendingGameToDeleteId = null;
  closeDeleteModal();

  syncScheduleList();
  await sendStateToFirebase(appState);

  showToast(`Partido ${targetVisitor} vs ${targetLocal} borrado con éxito.`, "success");

  renderFilters(appState, SCHEDULE);
  renderGames(appState, SCHEDULE, window.selectedGameIdToDelete);
  renderLeaderboard(appState, SCHEDULE);
}

export function setZoneFilter(zone) {
  appState.selectedZoneFilter = zone;
  renderFilters(appState, SCHEDULE);
  renderGames(appState, SCHEDULE, window.selectedGameIdToDelete);
}

export function setDateFilter(date) {
  appState.selectedDateFilter = date;
  renderFilters(appState, SCHEDULE);
  renderGames(appState, SCHEDULE, window.selectedGameIdToDelete);
}

export function initWorldClockCDMX() {
  const updateClock = () => {
    const now = new Date();
    const cdmxEl = document.getElementById('clock-cdmx');
    if (cdmxEl) {
      try {
        cdmxEl.textContent = new Intl.DateTimeFormat('es-MX', {
          timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }).format(now);
      } catch (e) {
        cdmxEl.textContent = '--:--:--';
      }
    }
  };

  updateClock();
  setInterval(updateClock, 1000);
}

export function renderAll() {
  window.appState = appState;
  window.SCHEDULE = SCHEDULE;
  renderLeaderboard(appState, SCHEDULE);
  renderFilters(appState, SCHEDULE);
  renderGames(appState, SCHEDULE, window.selectedGameIdToDelete);
}

// Ventana Global
window.onStatInputChange = onStatInputChange;
window.saveParticipantPrediction = saveParticipantPrediction;
window.deleteGameFromUI = deleteGameFromUI;
window.executeDeleteGame = executeDeleteGame;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.selectGameForDeletion = selectGameForDeletion;
window.setZoneFilter = setZoneFilter;
window.setDateFilter = setDateFilter;

export function startApp() {
  initData();
  renderAll();
  initWorldClockCDMX();
  initFirebaseConnection(applyIncomingState);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}