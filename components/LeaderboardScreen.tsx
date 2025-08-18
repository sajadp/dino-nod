import React, { useState } from 'react';

interface LeaderboardScreenProps {
    onBack: () => void;
}

const mockWeeklyData = [
    { rank: 1, name: 'VelocityRaptor', score: 258 },
    { rank: 2, name: 'TerraNod', score: 241 },
    { rank: 3, name: 'DinoMite', score: 220 },
    { rank: 4, name: 'Rex_Flex', score: 198 },
    { rank: 5, name: 'PteroDactyl', score: 175 },
    { rank: 6, name: 'StegoStar', score: 154 },
    { rank: 7, name: 'TriSarahTops', score: 132 },
    { rank: 8, name: 'Clever Girl', score: 111 },
    { rank: 9, name: 'FossilFuel', score: 99 },
    { rank: 10, name: 'EggScellent', score: 85 },
];

const mockMonthlyData = [
    { rank: 1, name: 'Nod-Zilla', score: 987 },
    { rank: 2, name: 'CometChaser', score: 950 },
    { rank: 3, name: 'VelocityRaptor', score: 890 },
    { rank: 4, name: 'JurassicJumper', score: 850 },
    { rank: 5, 'name': 'TerraNod', score: 812 },
    { rank: 6, 'name': 'MeteorMaverick', score: 780 },
    { rank: 7, 'name': 'DinoMite', score: 745 },
    { rank: 8, 'name': 'Rex_Flex', score: 711 },
    { rank: 9, 'name': 'SpinoSaurus', score: 680 },
    { rank: 10, 'name': 'TheNodFather', score: 650 },
];


const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
    const data = view === 'weekly' ? mockWeeklyData : mockMonthlyData;

    return (
        <div className="w-full max-w-md mx-auto text-center p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-green-500">🏆 Leaderboard 🏆</h1>

            <div className="flex justify-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setView('weekly')}
                    className={`flex-1 px-4 py-2 text-lg font-semibold rounded-md transition-colors ${view === 'weekly' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    This Week
                </button>
                <button
                    onClick={() => setView('monthly')}
                    className={`flex-1 px-4 py-2 text-lg font-semibold rounded-md transition-colors ${view === 'monthly' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    This Month
                </button>
            </div>

            <div className="space-y-3 h-80 overflow-y-auto pr-2">
                {data.map((entry) => (
                    <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <span className="w-8 text-lg font-bold text-gray-500 dark:text-gray-400">{entry.rank}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{entry.rank === 1 ? '👑' : ''} {entry.name}</span>
                        </div>
                        <span className="font-bold text-green-500">{entry.score}</span>
                    </div>
                ))}
            </div>

             <button
                onClick={onBack}
                className="w-full px-6 py-3 text-lg font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-transform transform hover:scale-105"
            >
                Back to Menu
            </button>
        </div>
    );
};

export default LeaderboardScreen;
