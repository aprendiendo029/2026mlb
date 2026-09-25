import React, { useEffect, useState } from "react";
import { subscribeToTodayGames } from "../../js/services/firebaseService";

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a los cambios en tiempo real
    const unsubscribe = subscribeToTodayGames((data) => {
      setGames(data);
      setLoading(false);
    });

    // Cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando partidos...</div>;
  }

  if (games.length === 0) {
    return <div className="p-4 text-center text-gray-500">No hay partidos registrados para hoy.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {games.map((game) => (
        <div 
          key={game.id} 
          className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow border-gray-200"
        >
          {/* Encabezado: Estatus del Partido */}
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              game.isFinished ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {game.status}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {game.stage === 'regular_season' ? 'Temporada Regular' : 'Playoffs'}
            </span>
          </div>

          {/* Marcadores */}
          <div className="space-y-2 my-4">
            <div className="flex justify-between items-center text-base font-semibold text-gray-800">
              <span>{game.awayTeam}</span>
              <span className="text-xl font-bold">{game.awayScore}</span>
            </div>
            <div className="flex justify-between items-center text-base font-semibold text-gray-800">
              <span>{game.homeTeam}</span>
              <span className="text-xl font-bold">{game.homeScore}</span>
            </div>
          </div>

          {/* Estadísticas Detalladas (Se muestran e insertan automáticamente cuando el juego es FINAL) */}
          {game.isFinished && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Estadísticas Finales (R - H - E | BB - HR - K)
              </p>
              
              <div className="space-y-1">
                <p>
                  <span className="font-semibold text-gray-800">{game.awayTeam}:</span>{" "}
                  {game.awayStats?.R}R | {game.awayStats?.H}H | {game.awayStats?.E}E —{" "}
                  <span className="text-gray-500">
                    {game.awayStats?.BB}BB, {game.awayStats?.HR}HR, {game.awayStats?.K}K
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-800">{game.homeTeam}:</span>{" "}
                  {game.homeStats?.R}R | {game.homeStats?.H}H | {game.homeStats?.E}E —{" "}
                  <span className="text-gray-500">
                    {game.homeStats?.BB}BB, {game.homeStats?.HR}HR, {game.homeStats?.K}K
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}