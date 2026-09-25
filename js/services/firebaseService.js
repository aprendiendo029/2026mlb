/**
 * Quiniela Béisbol MLB 2026 - Módulo de Servicio Firebase Firestore
 * Ubicación física: copia026mlb/js/services/firebaseService.js
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Importación saliendo de services hacia config
import { DEFAULT_SCHEDULE, PARTICIPANTS } from "../config/constants.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNtCtfIIhhwsEQLGtPKj2RW1qkzN3NqsA",
  authDomain: "quiniela-mlb-2026.firebaseapp.com",
  projectId: "quiniela-mlb-2026",
  storageBucket: "quiniela-mlb-2026.appspot.com",
  messagingSenderId: "105479218898655239343",
  appId: "1:1061925192246:web:074e57ee8ff132feae4e97"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

const seasonDocRef = doc(db, "seasons", "2026");
const gamesCollectionRef = collection(db, "seasons", "2026", "games");

function buildInitialState() {
  const official = {};
  const predictions = { gori: {}, mm: {}, tm: {} };
  const savedPredictions = {};

  DEFAULT_SCHEDULE.forEach(game => {
    official[game.id] = {
      visitorR: '', visitorH: '', visitorE: '', visitorBB: '', visitorHR: '', visitorK: '',
      localR: '', localH: '', localE: '', localBB: '', localHR: '', localK: '',
      winner: ''
    };
    savedPredictions[game.id] = { gori: false, mm: false, tm: false };
    PARTICIPANTS.forEach(p => {
      if (!predictions[p.id]) predictions[p.id] = {};
      predictions[p.id][game.id] = {
        visitorR: '', visitorH: '', visitorE: '', visitorBB: '', visitorHR: '', visitorK: '',
        localR: '', localH: '', localE: '', localBB: '', localHR: '', localK: '',
        winner: ''
      };
    });
  });

  return {
    official,
    predictions,
    savedPredictions,
    customSchedule: [],
    closedGames: {},
    selectedDateFilter: '2026-09-24',
    selectedZoneFilter: 'TODOS',
    lastUpdated: Date.now()
  };
}

export function initFirebaseConnection(onStateChangeCallback) {
  const statusBadge = document.getElementById("cloud-status-badge");
  const statusDot = document.getElementById("cloud-status-dot");
  const statusText = document.getElementById("cloud-status-text");

  const setConnectedUI = (isConnected) => {
    if (!statusBadge || !statusDot || !statusText) return;
    if (isConnected) {
      statusBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-400/30";
      statusDot.className = "w-2 h-2 rounded-full bg-emerald-500";
      statusText.textContent = "Conectado a Firebase";
    } else {
      statusBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-700 border border-red-400/30";
      statusDot.className = "w-2 h-2 rounded-full bg-red-500";
      statusText.textContent = "Error de Conexión";
    }
  };

  let currentCustomGames = [];
  let fetchedOfficialStats = {};
  let fetchedClosedGames = {};
  let latestSeasonData = {};

  const emitUnifiedState = () => {
    if (typeof onStateChangeCallback !== "function") return;

    currentCustomGames.sort((a, b) => {
      const timeA = a.rawDateTime ? new Date(a.rawDateTime).getTime() : 0;
      const timeB = b.rawDateTime ? new Date(b.rawDateTime).getTime() : 0;
      return timeA - timeB;
    });

    const remoteOfficial = {
      ...(latestSeasonData.official || {}),
      ...fetchedOfficialStats
    };
    
    const remotePredictions = latestSeasonData.predictions || {};
    const remoteSavedPredictions = latestSeasonData.savedPredictions || {};
    const remoteClosedGames = {
      ...(latestSeasonData.closedGames || {}),
      ...fetchedClosedGames
    };

    const activeDateFilter = latestSeasonData.selectedDateFilter || '2026-09-24';

    const unifiedData = {
      official: remoteOfficial,
      predictions: remotePredictions,
      savedPredictions: remoteSavedPredictions,
      closedGames: remoteClosedGames,
      customSchedule: currentCustomGames,
      selectedDateFilter: activeDateFilter,
      selectedZoneFilter: latestSeasonData.selectedZoneFilter || 'TODOS',
      lastUpdated: latestSeasonData.lastUpdated || Date.now()
    };

    console.log("📡 Emitiendo datos a la UI. Partidos procesados:", currentCustomGames.length);
    onStateChangeCallback(unifiedData);
  };

  onSnapshot(gamesCollectionRef, (gamesSnapshot) => {
    currentCustomGames = [];
    fetchedOfficialStats = {};
    fetchedClosedGames = {};

    gamesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const gameId = docSnap.id;

      const visitor = data.awayTeam || data.visitor || data.visitorTeam || '';
      const local = data.homeTeam || data.local || data.localTeam || '';

      if (!visitor && !local) return;

      let cleanDate = '2026-09-24';
      if (data.gameDate) {
        cleanDate = String(data.gameDate).split('T')[0];
      } else if (data.date) {
        cleanDate = String(data.date).split('T')[0];
      }

      const statusUpper = String(data.status || '').toUpperCase();
      const isFinished = statusUpper === 'FINAL' || statusUpper === 'COMPLETED EARLY' || Boolean(data.isFinished === true);

      const formattedGame = {
        id: gameId,
        gameId: gameId,
        date: cleanDate,
        gameDate: cleanDate,
        rawDateTime: data.gameDate || data.rawDateTime || '',
        visitor: visitor,
        awayTeam: visitor,
        visitorTeam: visitor,
        local: local,
        homeTeam: local,
        localTeam: local,
        status: data.status || 'Scheduled',
        isFinished: isFinished,
        optional: Boolean(data.optional),
        custom: true,
        ...data
      };

      currentCustomGames.push(formattedGame);

      if (isFinished) {
        fetchedClosedGames[gameId] = true;
      }

      if (data.awayStats || data.homeStats) {
        const away = data.awayStats || {};
        const home = data.homeStats || {};
        
        let winner = '';
        if ((away.R || 0) > (home.R || 0)) winner = visitor;
        else if ((home.R || 0) > (away.R || 0)) winner = local;

        fetchedOfficialStats[gameId] = {
          visitorR: away.R !== undefined ? away.R : '',
          visitorH: away.H !== undefined ? away.H : '',
          visitorE: away.E !== undefined ? away.E : '',
          visitorBB: away.BB !== undefined ? away.BB : '',
          visitorHR: away.HR !== undefined ? away.HR : '',
          visitorK: away.K !== undefined ? away.K : '',
          localR: home.R !== undefined ? home.R : '',
          localH: home.H !== undefined ? home.H : '',
          localE: home.E !== undefined ? home.E : '',
          localBB: home.BB !== undefined ? home.BB : '',
          localHR: home.HR !== undefined ? home.HR : '',
          localK: home.K !== undefined ? home.K : '',
          winner: winner
        };
      }
    });

    setConnectedUI(true);
    emitUnifiedState();
  }, (error) => {
    console.error("Error al escuchar games en Firestore:", error);
    setConnectedUI(false);
  });

  onSnapshot(seasonDocRef, async (snapshot) => {
    setConnectedUI(true);

    if (snapshot.exists()) {
      latestSeasonData = snapshot.data();
      emitUnifiedState();
    } else {
      const initialState = buildInitialState();
      await setDoc(seasonDocRef, initialState);
    }
  }, (error) => {
    console.error("Error en documento principal de temporada:", error);
    setConnectedUI(false);
  });
}

export async function deleteCustomGame(gameId) {
  try {
    const gameDocRef = doc(db, "seasons", "2026", "games", gameId);
    await deleteDoc(gameDocRef);
    console.log(`✅ Juego ${gameId} eliminado de la base de datos Firestore`);
    return true;
  } catch (error) {
    console.error(`❌ Error al borrar el juego ${gameId} de Firestore:`, error);
    return false;
  }
}

export async function sendStateToFirebase(appState) {
  try {
    const payload = {
      official: appState.official || {},
      predictions: appState.predictions || {},
      savedPredictions: appState.savedPredictions || {},
      closedGames: appState.closedGames || {},
      selectedDateFilter: appState.selectedDateFilter || '2026-09-24',
      selectedZoneFilter: appState.selectedZoneFilter || 'TODOS',
      lastUpdated: Date.now()
    };

    await setDoc(seasonDocRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al guardar estado en Firebase:", error);
    return false;
  }
}