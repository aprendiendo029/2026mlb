/**
 * Quiniela Béisbol MLB 2026 - Renderizado de Interfaz de Usuario y DOM
 * Archivo: js/ui/render.js
 */

import { TEAMS, PARTICIPANTS, STAT_VARS } from "../config/constants.js";

export function getGameCDMXDateStr(rawDateTime) {
  if (!rawDateTime) return '';
  const dateObj = new Date(rawDateTime);
  if (isNaN(dateObj.getTime())) {
    return String(rawDateTime).split('T')[0];
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(dateObj);
  
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

function formatDateDDMMAA(dateStr) {
  if (!dateStr) return '';
  const cleanDate = String(dateStr).split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const shortYear = year.length === 4 ? year.slice(-2) : year;
    return `${day}/${month}/${shortYear}`;
  }
  return dateStr;
}

function formatGameTimes(rawDateTime) {
  if (!rawDateTime) return { mlbTime: 'N/D', cdmxTime: 'N/D' };
  
  const dateObj = new Date(rawDateTime);
  if (isNaN(dateObj.getTime())) return { mlbTime: 'N/D', cdmxTime: 'N/D' };

  const mlbTime = dateObj.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: true
  });

  const cdmxTime = dateObj.toLocaleTimeString('es-MX', {
    timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return { mlbTime: `${mlbTime} ET`, cdmxTime: `${cdmxTime} CDMX` };
}

function getTeamData(teamKeyOrId) {
  if (!teamKeyOrId) return { id: 'N/A', code: 'N/A', name: 'Desconocido', logo: '', zone: 'AL' };

  const strSearch = String(teamKeyOrId).trim().toLowerCase();

  if (TEAMS[teamKeyOrId]) {
    const t = TEAMS[teamKeyOrId];
    return { ...t, code: t.code || teamKeyOrId };
  }

  const foundKey = Object.keys(TEAMS).find(k => {
    const t = TEAMS[k];
    return String(t.id).toLowerCase() === strSearch ||
           String(t.code || '').toLowerCase() === strSearch ||
           String(t.name).toLowerCase() === strSearch ||
           strSearch.includes(String(t.name).toLowerCase());
  });

  if (foundKey) {
    const t = TEAMS[foundKey];
    return { ...t, code: t.code || foundKey };
  }

  return { id: teamKeyOrId, code: String(teamKeyOrId).substring(0, 3).toUpperCase(), name: teamKeyOrId, logo: '', zone: 'AL' };
}

export function showToast(message, type = 'success') {
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col gap-2 max-w-md w-full px-4';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  let bgClass = 'bg-emerald-600 border-emerald-400/40 text-white';
  let icon = '✓';
  if (type === 'error') {
    bgClass = 'bg-red-600 border-red-400/40 text-white';
    icon = '⚠️';
  } else if (type === 'info') {
    bgClass = 'bg-slate-800 border-slate-700 text-white';
    icon = '🔒';
  }

  toastEl.className = `pointer-events-auto flex items-center space-x-3 p-3.5 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold ${bgClass}`;
  toastEl.innerHTML = `
    <span class="text-base shrink-0">${icon}</span>
    <span class="flex-1 leading-snug">${message}</span>
  `;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.remove();
  }, 4000);
}

export function openDeleteModal(gameId) {
  window.pendingGameToDeleteId = gameId;
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeDeleteModal() {
  window.pendingGameToDeleteId = null;
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function selectGameForDeletion(gameId) {
  window.selectedGameIdToDelete = gameId;
  window.pendingGameToDeleteId = gameId;
  renderGames(window.appState, window.SCHEDULE, gameId);
}

export function calculateTotalSum(visVal, locVal) {
  if (visVal === '' || visVal === null || visVal === undefined) return null;
  if (locVal === '' || locVal === null || locVal === undefined) return null;
  const v = parseInt(String(visVal).trim(), 10);
  const l = parseInt(String(locVal).trim(), 10);
  if (isNaN(v) || isNaN(l)) return null;
  return v + l;
}

export function computeOfficialWinner(off) {
  if (!off || off.visitorR === undefined || off.localR === undefined || off.visitorR === '' || off.localR === '') {
    return off?.winner && off.winner !== 'tie' ? off.winner : '';
  }
  const vR = Number(off.visitorR);
  const lR = Number(off.localR);
  if (isNaN(vR) || isNaN(lR)) return '';
  if (vR > lR) return 'visitor';
  if (lR > vR) return 'local';
  return '';
}

export function isGameFinished(game, appState = {}) {
  const status = String(game.status || game.gameStatus || game.detailedState || '').toUpperCase();
  const isFinishedFlag = game.isFinished === true || appState.closedGames?.[game.id]?.isFinished;

  if (isFinishedFlag || status === 'FINAL' || status.includes('COMPLETED') || status.includes('GAME OVER')) {
    return true;
  }
  return false;
}

export function isGameStartedOrInProgress(game, appState = {}) {
  const status = String(game.status || game.gameStatus || game.detailedState || '').toUpperCase();
  
  if (isGameFinished(game, appState)) {
    return false;
  }

  if (status.includes('PREGAME') || status.includes('PRE-GAME') || status.includes('SCHEDULED') || status.includes('UPCOMING')) {
    return false;
  }

  if (status.includes('IN PROGRESS') || status.includes('LIVE') || status.includes('WARMUP') || 
      status.includes('TOP') || status.includes('BOT') || status.includes('1ST') || 
      status.includes('2ND') || status.includes('3RD') || status.includes('INNING')) {
    return true;
  }

  const rawTime = game.rawDateTime || game.gameDate;
  if (rawTime) {
    const gameDate = new Date(rawTime);
    if (!isNaN(gameDate.getTime()) && Date.now() >= gameDate.getTime()) {
      return true;
    }
  }
  return false;
}

export function isGameLockedByTimeOrStatus(game, appState) {
  if (appState.closedGames?.[game.id]?.locked) {
    return true;
  }
  if (isGameFinished(game, appState) || isGameStartedOrInProgress(game, appState)) {
    return true;
  }
  return false;
}

export function arePredictionsRevealed(appState, game) {
  const gameId = game.id;
  if (appState.closedGames && appState.closedGames[gameId] && appState.closedGames[gameId].revealed) {
    return true;
  }
  
  if (isGameStartedOrInProgress(game, appState) || isGameFinished(game, appState)) {
    return true;
  }

  let savedCount = 0;
  PARTICIPANTS.forEach(p => {
    if (appState.savedPredictions?.[gameId]?.[p.id]) {
      savedCount++;
    }
  });
  return savedCount >= 3;
}

export function updateScoreboardValidations(appState, schedule) {
  schedule.forEach(game => {
    const off = appState.official[game.id] || {};

    STAT_VARS.forEach(s => {
      const offTotEl = document.getElementById(`cell-${game.id}-off-tot${s.key}`);
      if (offTotEl) {
        const oTot = calculateTotalSum(off['visitor' + s.key], off['local' + s.key]);
        offTotEl.textContent = oTot !== null ? oTot : '-';
      }
    });

    const offWinner = computeOfficialWinner(off);
    const offWinnerSelect = document.getElementById(`select-official-winner-${game.id}`);
    if (offWinnerSelect) {
      offWinnerSelect.value = offWinner;
    }
  });
}

export function calculateParticipantScores(appState, schedule) {
  const scores = { gori: 0, mm: 0, tm: 0 };

  schedule.forEach(game => {
    const off = appState.official[game.id];
    if (!off) return;

    const offWinner = computeOfficialWinner(off);
    
    // Un partido se evalúa para puntaje únicamente cuando el estatus es FINAL
    if (!isGameFinished(game, appState)) return;

    PARTICIPANTS.forEach(p => {
      const userPred = (appState.predictions[p.id] || {})[game.id];
      if (!userPred) return;

      let pPoints = 0;
      
      // 1. Evaluar variables individuales (Visitor & Local para cada variable estadística)
      STAT_VARS.forEach(s => {
        const visPred = userPred['visitor' + s.key];
        const visOff = off['visitor' + s.key];
        if (visPred !== undefined && visPred !== '' && visOff !== undefined && visOff !== '' && Number(visPred) === Number(visOff)) {
          pPoints++;
        }

        const locPred = userPred['local' + s.key];
        const locOff = off['local' + s.key];
        if (locPred !== undefined && locPred !== '' && locOff !== undefined && locOff !== '' && Number(locPred) === Number(locOff)) {
          pPoints++;
        }

        // 2. Evaluar acierto en el TOTAL combinado por juego
        const userTot = calculateTotalSum(visPred, userPred['local' + s.key]);
        const offTot = calculateTotalSum(visOff, locOff);
        if (userTot !== null && offTot !== null && userTot === offTot) {
          pPoints++;
        }
      });

      // 3. Evaluar acierto en el equipo Ganador
      let predWinner = userPred.winner;
      if (!predWinner && userPred.visitorR !== undefined && userPred.localR !== undefined && userPred.visitorR !== '' && userPred.localR !== '') {
        const vR = Number(userPred.visitorR);
        const lR = Number(userPred.localR);
        if (vR > lR) predWinner = 'visitor';
        else if (lR > vR) predWinner = 'local';
      }

      if (offWinner && predWinner && offWinner === predWinner) {
        pPoints++;
      }

      scores[p.id] = (scores[p.id] || 0) + pPoints;
    });
  });

  return scores;
}

export function renderLeaderboard(appState, schedule) {
  const container = document.getElementById('leaderboard-container');
  if (!container) return;

  const scores = calculateParticipantScores(appState, schedule);
  
  let html = '';
  PARTICIPANTS.forEach(p => {
    const score = scores[p.id] || 0;
    html += `
      <div class="flex items-center bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
        <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${p.themeHex};"></span>
        <span class="font-bold text-xs sm:text-sm text-slate-800">${p.name}</span>
        <span class="ml-3 px-2 py-0.5 rounded-xl bg-slate-100 text-slate-900 font-extrabold text-xs border">${score} pts</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

export function renderFilters(appState, schedule) {
  const currentZone = appState.selectedZoneFilter || 'TODOS';
  const zones = ['TODOS', 'AL', 'NL'];
  
  zones.forEach(z => {
    const btn = document.getElementById(`zone-btn-${z}`);
    if (btn) {
      if (z === currentZone) {
        btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all bg-blue-600/40 text-slate-900 border border-blue-500/50 shadow-sm";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-300/50";
      }
    }
  });

  const dates = ['TODOS', ...new Set(schedule.map(s => getGameCDMXDateStr(s.rawDateTime || s.gameDate || s.date)))].filter(Boolean);
  const container = document.getElementById('date-filter-buttons');
  if (!container) return;  
  
  let html = '';
  dates.forEach(date => {
    const isActive = appState.selectedDateFilter === date;
    html += `
      <button 
        onclick="setDateFilter('${date}')"
        class="px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${isActive ? 'bg-blue-600/40 text-slate-900 font-bold shadow-sm border border-blue-500/50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
      >
        ${date === 'TODOS' ? 'TODOS' : formatDateDDMMAA(date)}
      </button>
    `;
  });

  container.innerHTML = html;
}

export function renderGames(appState, schedule, selectedGameIdToDelete) {
  const container = document.getElementById('games-container');
  if (!container) return;  
  
  const filteredGames = schedule.filter(game => {
    const visId = game.visitor || game.awayTeam || game.awayTeamId;
    const locId = game.local || game.homeTeam || game.homeTeamId;
    const gameDateCDMX = getGameCDMXDateStr(game.rawDateTime || game.gameDate || game.date);

    if (appState.selectedZoneFilter && appState.selectedZoneFilter !== 'TODOS') {
      const vis = getTeamData(visId);
      const loc = getTeamData(locId);
      if (vis.zone !== appState.selectedZoneFilter && loc.zone !== appState.selectedZoneFilter) {
        return false;
      }
    }
    return appState.selectedDateFilter === 'TODOS' || gameDateCDMX === appState.selectedDateFilter;
  });

  const countBadge = document.getElementById('game-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filteredGames.length} Partidos`;
  }

  if (filteredGames.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm">
        <p class="text-slate-500 font-medium">No se encontraron encuentros cargados para este filtro.</p>
      </div>
    `;
    return;
  }

  let html = '';

  filteredGames.forEach((game) => {
    const visId = game.visitor || game.awayTeam || game.awayTeamId;
    const locId = game.local || game.homeTeam || game.homeTeamId;
    const gameDateCDMX = getGameCDMXDateStr(game.rawDateTime || game.gameDate || game.date);

    const visTeam = getTeamData(visId);
    const locTeam = getTeamData(locId);
    const off = appState.official[game.id] || game.official || {};
    const formattedDateStr = formatDateDDMMAA(gameDateCDMX);
    const { mlbTime, cdmxTime } = formatGameTimes(game.rawDateTime || game.gameDate);

    const isFinished = isGameFinished(game, appState);
    const isStartedOrInProgress = isGameStartedOrInProgress(game, appState);
    const isRevealed = arePredictionsRevealed(appState, game);
    const isLocked = isGameLockedByTimeOrStatus(game, appState);
    const offWinner = computeOfficialWinner(off);

    const isSelectedForDelete = selectedGameIdToDelete === game.id;

    html += `
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        
        <!-- Encabezado del Partido -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div class="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              ${formattedDateStr} · ${cdmxTime}
            </span>
            <span class="text-xs text-slate-500 font-medium">${mlbTime}</span>
            ${isRevealed 
              ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">🔓 Pronósticos Revelados</span>` 
              : `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">🔒 Pronóstico Ciego Activo</span>`
            }
          </div>

          <button 
            type="button" 
            onclick="selectGameForDeletion('${game.id}')"
            class="px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${isSelectedForDelete ? 'bg-red-500/20 text-red-700 border-red-500/40 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            <span class="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center bg-white ${isSelectedForDelete ? 'border-red-600' : ''}">
              ${isSelectedForDelete ? '<span class="w-2 h-2 rounded-full bg-red-600"></span>' : ''}
            </span>
            <span>Borrar pizarra</span>
          </button>
        </div>

        <!-- ÁREA DE TRABAJO CON LAS 4 PIZARRAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
          
          <!-- PIZARRA 1: OFICIAL -->
          <div class="bg-slate-100/90 rounded-xl p-3 border border-slate-300 flex flex-col justify-between min-h-full space-y-3">
            <div>
              <div class="pb-2 mb-2 border-b border-slate-300 text-center flex items-center justify-between px-1 gap-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    PIZARRA OFICIAL
                  </h4>
                </div>
              </div>

              <div class="overflow-x-auto rounded-lg border border-slate-300 bg-white">
                <table class="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr class="bg-slate-900 text-white font-bold uppercase text-[10px]">
                      <th class="py-1.5 px-2 text-left w-20 font-sans">EQ</th>
                      ${STAT_VARS.map(s => `<th class="py-1.5 px-0.5">${s.label}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr class="bg-slate-50 font-semibold text-slate-800">
                      <td class="py-1 px-1.5 text-left font-sans font-bold flex items-center gap-1">
                        <img src="${visTeam.logo}" class="w-4 h-4 object-contain" onerror="this.style.display='none'"/>
                        <span class="text-[11px]">${visTeam.code}</span>
                      </td>
                      ${STAT_VARS.map(s => `
                        <td class="py-1 px-0.5">
                          <input 
                            type="number" min="0" placeholder="-"
                            class="w-7 text-center bg-white border border-slate-300 rounded p-0.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                            value="${off['visitor' + s.key] ?? ''}"
                            ${isFinished ? 'disabled' : ''}
                            onchange="onStatInputChange('${game.id}', 'official', 'visitor${s.key}', this.value)"
                          />
                        </td>
                      `).join('')}
                    </tr>

                    <tr class="bg-slate-50 font-semibold text-slate-800">
                      <td class="py-1 px-1.5 text-left font-sans font-bold flex items-center gap-1">
                        <img src="${locTeam.logo}" class="w-4 h-4 object-contain" onerror="this.style.display='none'"/>
                        <span class="text-[11px]">${locTeam.code}</span>
                      </td>
                      ${STAT_VARS.map(s => `
                        <td class="py-1 px-0.5">
                          <input 
                            type="number" min="0" placeholder="-"
                            class="w-7 text-center bg-white border border-slate-300 rounded p-0.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                            value="${off['local' + s.key] ?? ''}"
                            ${isFinished ? 'disabled' : ''}
                            onchange="onStatInputChange('${game.id}', 'official', 'local${s.key}', this.value)"
                          />
                        </td>
                      `).join('')}
                    </tr>

                    <tr class="bg-blue-100/80 font-black text-blue-950">
                      <td class="py-1.5 px-1.5 text-left font-sans text-[10px]">TOT</td>
                      ${STAT_VARS.map(s => {
                        const visVal = off['visitor' + s.key] ?? '';
                        const locVal = off['local' + s.key] ?? '';
                        const tot = calculateTotalSum(visVal, locVal);
                        return `<td id="cell-${game.id}-off-tot${s.key}" class="py-1.5 px-0.5 text-xs">${tot !== null ? tot : '-'}</td>`;
                      }).join('')}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-2.5 pt-2 border-t border-slate-200">
                <label class="block text-[10px] font-bold text-slate-600 mb-1">Ganador (Automático):</label>
                <select 
                  id="select-official-winner-${game.id}"
                  disabled
                  class="w-full bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg p-1 cursor-not-allowed"
                >
                  <option value="" ${(!offWinner) ? 'selected' : ''}>-- --</option>
                  ${offWinner ? `
                    <option value="visitor" ${offWinner === 'visitor' ? 'selected' : ''}>[${visTeam.code}]${visTeam.name}</option>
                    <option value="local" ${offWinner === 'local' ? 'selected' : ''}>[${locTeam.code}]${locTeam.name}</option>
                  ` : ''}
                </select>
              </div>
            </div>
            
            <div class="flex justify-center items-center pt-1">
              ${isFinished 
                ? `<span class="px-3 py-1 rounded-full text-[11px] font-black bg-[#36454F]/20 text-slate-900 border border-slate-400/40 tracking-widest shadow-sm">FINAL</span>`
                : isStartedOrInProgress 
                  ? `<span class="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white tracking-wider animate-pulse shadow-sm flex items-center justify-center">En juego</span>`
                  : `<span class="text-[10px] font-bold text-slate-500">Marcador en espera</span>`
              }
            </div>
          </div>

          <!-- PIZARRAS 2, 3 Y 4: PARTICIPANTES -->
          ${PARTICIPANTS.map(p => {
            const userPred = (appState.predictions[p.id] || {})[game.id] || {};
            const isSaved = appState.savedPredictions?.[game.id]?.[p.id] || false;
            
            const isParticipantLocked = isSaved || isLocked;
            const canEdit = !isParticipantLocked;

            let savedWinner = userPred.winner;
            if (!savedWinner && userPred.visitorR !== undefined && userPred.localR !== undefined && userPred.visitorR !== '' && userPred.localR !== '') {
              const vR = Number(userPred.visitorR);
              const lR = Number(userPred.localR);
              if (vR > lR) savedWinner = 'visitor';
              else if (lR > vR) savedWinner = 'local';
            }

            const grayLockedClass = 'bg-slate-400/30 text-slate-800 font-bold';

            let winnerBg = '';
            if (isFinished && offWinner && savedWinner) {
              const isWinnerExact = savedWinner === offWinner;
              winnerBg = isWinnerExact ? 'bg-emerald-600/20 text-emerald-950 font-black border-emerald-500/40' : 'bg-red-600/20 text-red-950 font-black border-red-500/40';
            } else if (isStartedOrInProgress) {
              winnerBg = grayLockedClass + ' border-transparent';
            }

            let savedBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            if (p.id === 'mm') {
              savedBadgeClass = 'bg-emerald-200/90 text-emerald-900 border-emerald-400';
            }

            return `
              <div class="${p.bgClass} rounded-xl p-3 border${p.borderClass} flex flex-col justify-between min-h-full space-y-3 transition-all">
                
                <div>
                  <div class="flex items-center justify-center space-x-2 pb-2 mb-2 border-b border-slate-200/80">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${p.themeHex}"></span>
                    <span class="font-black text-xs text-slate-800 font-sans uppercase">${p.name}</span>
                  </div>

                  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table class="w-full text-center border-collapse text-xs font-mono">
                      <thead>
                        <tr class="bg-slate-800 text-white font-bold text-[10px]">
                          <th class="py-1.5 px-1.5 text-left w-20 font-sans">EQ</th>
                          ${STAT_VARS.map(s => `<th class="py-1.5 px-0.5">${s.label}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200">
                        
                        <tr class="text-slate-800">
                          <td class="py-1 px-1.5 text-left font-sans font-bold flex items-center gap-1">
                            <img src="${visTeam.logo}" class="w-4 h-4 object-contain" onerror="this.style.display='none'"/>
                            <span class="text-[11px]">${visTeam.code}</span>
                          </td>
                          ${STAT_VARS.map(s => {
                            const val = userPred['visitor' + s.key] ?? '';
                            const offVal = off['visitor' + s.key];
                            const hasOfficial = offVal !== undefined && offVal !== '';
                            const isExact = hasOfficial && val !== '' && Number(val) === Number(offVal);

                            let cellBg = '';
                            if (isFinished && isRevealed && hasOfficial && val !== '') {
                              cellBg = isExact ? 'bg-emerald-600/20 text-emerald-950 font-black' : 'bg-red-600/20 text-red-950 font-black';
                            } else if (isStartedOrInProgress) {
                              cellBg = grayLockedClass;
                            } else if (isParticipantLocked) {
                              cellBg = grayLockedClass;
                            }

                            const displayVal = (!isRevealed && isSaved) ? '•••' : (val !== '' ? val : '-');

                            return `
                              <td class="py-1 px-0.5 ${cellBg}">
                                <input 
                                  type="text"
                                  class="w-7 text-center rounded p-0.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 disabled:text-slate-800 ${cellBg ? cellBg + ' border-transparent' : 'bg-white border border-slate-300'}"
                                  value="${displayVal}"
                                  ${!canEdit ? 'disabled' : ''}
                                  onchange="onStatInputChange('${game.id}', '${p.id}', 'visitor${s.key}', this.value)"
                                />
                              </td>
                            `;
                          }).join('')}
                        </tr>

                        <tr class="text-slate-800">
                          <td class="py-1 px-1.5 text-left font-sans font-bold flex items-center gap-1">
                            <img src="${locTeam.logo}" class="w-4 h-4 object-contain" onerror="this.style.display='none'"/>
                            <span class="text-[11px]">${locTeam.code}</span>
                          </td>
                          ${STAT_VARS.map(s => {
                            const val = userPred['local' + s.key] ?? '';
                            const offVal = off['local' + s.key];
                            const hasOfficial = offVal !== undefined && offVal !== '';
                            const isExact = hasOfficial && val !== '' && Number(val) === Number(offVal);

                            let cellBg = '';
                            if (isFinished && isRevealed && hasOfficial && val !== '') {
                              cellBg = isExact ? 'bg-emerald-600/20 text-emerald-950 font-black' : 'bg-red-600/20 text-red-950 font-black';
                            } else if (isStartedOrInProgress) {
                              cellBg = grayLockedClass;
                            } else if (isParticipantLocked) {
                              cellBg = grayLockedClass;
                            }

                            const displayVal = (!isRevealed && isSaved) ? '•••' : (val !== '' ? val : '-');

                            return `
                              <td class="py-1 px-0.5 ${cellBg}">
                                <input 
                                  type="text"
                                  class="w-7 text-center rounded p-0.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 disabled:text-slate-800 ${cellBg ? cellBg + ' border-transparent' : 'bg-white border border-slate-300'}"
                                  value="${displayVal}"
                                  ${!canEdit ? 'disabled' : ''}
                                  onchange="onStatInputChange('${game.id}', '${p.id}', 'local${s.key}', this.value)"
                                />
                              </td>
                            `;
                          }).join('')}
                        </tr>

                        <tr class="bg-slate-100 font-bold text-slate-900">
                          <td class="py-1.5 px-1.5 text-left font-sans text-[10px]">TOT</td>
                          ${STAT_VARS.map(s => {
                            const visVal = userPred['visitor' + s.key] ?? '';
                            const locVal = userPred['local' + s.key] ?? '';
                            const tot = calculateTotalSum(visVal, locVal);

                            const visOff = off['visitor' + s.key];
                            const locOff = off['local' + s.key];
                            const totOff = calculateTotalSum(visOff, locOff);

                            const hasOfficialTot = totOff !== null;
                            const hasUserTot = tot !== null;
                            const isExactTot = hasOfficialTot && hasUserTot && tot === totOff;

                            let totBg = isStartedOrInProgress ? grayLockedClass : (isParticipantLocked ? grayLockedClass : 'text-slate-700');

                            if (isFinished && isRevealed && hasOfficialTot && hasUserTot) {
                              totBg = isExactTot ? 'bg-emerald-600/20 text-emerald-950 font-black' : 'bg-red-600/20 text-red-950 font-black';
                            }

                            const displayTot = (!isRevealed && isSaved) ? '•••' : (tot !== null ? tot : '-');

                            return `<td class="py-1.5 px-0.5 ${totBg}">${displayTot}</td>`;
                          }).join('')}
                        </tr>

                      </tbody>
                    </table>
                  </div>

                  <div class="mt-2.5 pt-2 border-t border-slate-200/80">
                    <label class="block text-[10px] font-bold text-slate-600 mb-1">Pronóstico Ganador:</label>
                    ${(!isRevealed && isSaved) ? `
                      <div class="w-full ${grayLockedClass} text-[11px] font-bold rounded-lg p-1 text-center select-none">
                        ••••••••••••
                      </div>
                    ` : `
                      <select 
                        class="w-full border text-[11px] font-bold rounded-lg p-1 focus:ring-1 focus:ring-blue-500 disabled:opacity-100 ${winnerBg ? winnerBg : isParticipantLocked ? grayLockedClass + ' border-transparent' : 'bg-white border-slate-300 text-slate-800'}"
                        ${!canEdit ? 'disabled' : ''}
                        onchange="onStatInputChange('${game.id}', '${p.id}', 'winner', this.value)"
                      >
                        <option value="">-- Seleccionar Ganador --</option>
                        <option value="visitor" ${savedWinner === 'visitor' ? 'selected' : ''}>[${visTeam.code}] ${visTeam.name}</option>
                        <option value="local" ${savedWinner === 'local' ? 'selected' : ''}>[${locTeam.code}] ${locTeam.name}</option>
                      </select>
                    `}
                  </div>
                </div>

                <div class="flex justify-center items-center pt-1">
                  ${isSaved ? `
                    <span class="px-3 py-1 rounded-full text-[11px] font-extrabold border flex items-center gap-1.5 shadow-sm ${savedBadgeClass}">
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                      </svg>
                      <span>Guardado y cerrado</span>
                    </span>
                  ` : `
                    <button 
                      type="button" 
                      onclick="saveParticipantPrediction('${game.id}', '${p.id}')"
                      ${!canEdit ? 'disabled' : ''}
                      class="w-full sm:w-auto px-4 py-1.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                      </svg>
                      <span>Guardar</span>
                    </button>
                  `}
                </div>

              </div>
            `;
          }).join('')}

        </div>

      </div>
    `;
  });

  container.innerHTML = html;
}