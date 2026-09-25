import React from 'react';
import GamesList from './components/GamesList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          ⚾ Quiniela MLB 2026
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Sincronización en tiempo real de partidos y estadísticas
        </p>
      </header>

      <main>
        {/* Renderizado del componente con los partidos de Firestore */}
        <GamesList />
      </main>
    </div>
  );
}

export default App;