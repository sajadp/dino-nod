import React, { useRef, useState } from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onShowLeaderboard: () => void;
  userName: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart, onShowLeaderboard, userName }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const getRank = (score: number) => {
    if (score < 5) return { title: 'Dino Egg', icon: '🥚' };
    if (score <= 15) return { title: 'Hatchling', icon: '🐣' };
    if (score <= 30) return { title: 'Junior Jumper', icon: '🦖' };
    if (score <= 60) return { title: 'Raptor Runner', icon: '💨' };
    return { title: 'Nod-zilla!', icon: '🐲' };
  };

  const { title: rankTitle, icon: rankIcon } = getRank(score);

  const handleShare = async () => {
    if (!shareCardRef.current || isSharing) return;

    setIsSharing(true);
    try {
      // Temporarily make the element visible for screenshotting, but off-screen
      shareCardRef.current.style.position = 'absolute';
      shareCardRef.current.style.left = '0px';
      shareCardRef.current.style.top = '0px';
      shareCardRef.current.style.opacity = '1';
      document.body.appendChild(shareCardRef.current);


      const canvas = await (window as any).html2canvas(shareCardRef.current, { 
        useCORS: true,
        backgroundColor: '#10141c',
        scale: 2 
      });
      
      document.body.removeChild(shareCardRef.current);
      shareCardRef.current.style.position = 'fixed';
      shareCardRef.current.style.left = '-9999px';
      shareCardRef.current.style.top = '-9999px';
      shareCardRef.current.style.opacity = '0';


      canvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          const file = new File([blob], 'dino-nod-score.png', { type: 'image/png' });
          const shareData = {
            files: [file],
            title: `I'm a ${rankTitle} in Dino Nod!`,
            text: `I scored ${score} and earned the rank of ${rankTitle}! Can you beat me? Play this fun neck exercise game!`,
          };

          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            alert("Sharing is not supported on your browser, but you can take a screenshot!");
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Could not generate share image. Please try taking a screenshot.');
    } finally {
        setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-6">
      
      {/* This is the hidden element that gets screenshotted, now with improved styling */}
      <div
        ref={shareCardRef}
        style={{
          '--dot-bg': '#10141c',
          '--dot-color': 'rgba(255, 255, 255, 0.1)',
          '--dot-size': '1px',
          '--dot-space': '20px',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        } as React.CSSProperties}
        className="fixed -left-[9999px] top-0 opacity-0 w-[450px] h-[800px] p-10 bg-[#10141c] text-white flex flex-col items-center justify-between font-sans rounded-2xl overflow-hidden"
      >
        {/* Top Section */}
        <div className="text-center w-full">
            <div className="flex justify-center items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg"/>
              <h2 className="text-4xl font-bold text-green-400">Dino Nod</h2>
            </div>
            <p className="text-lg font-light text-gray-300">{userName}'s Record</p>
        </div>
        
        {/* Middle Section */}
        <div className="text-center" style={{ transform: 'translateY(-85px)' }}>
            <div className="text-9xl mb-4 drop-shadow-lg" style={{ transform: 'translateY(-30px)' }}>{rankIcon}</div>
            <p className="text-5xl font-extrabold text-white">{rankTitle}</p>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex flex-col items-center">
            <div className="w-full bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center mb-6">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Your Score</p>
                <div style={{ transform: 'translateY(-40px)' }} className="text-9xl font-black text-yellow-300 [text-shadow:_0_4px_8px_rgba(0,0,0,0.5)] my-1">{score}</div>
                <p className="text-lg text-gray-300">High Score: {highScore}</p>
            </div>
            
            <div className="text-center">
                <p className="text-md font-light">Think you can nod better?</p>
                <div className="mt-2 text-md font-semibold bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg">
                    <div style={{ transform: 'translateY(-10px)' }}>Play at Dino-Nod.Game</div>
                </div>
            </div>
        </div>
      </div>

      <h2 className="text-4xl font-bold text-red-500">Game Over</h2>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-2">
        <p className="text-lg">Your Score: <span className="font-bold text-2xl text-green-500">{score}</span></p>
        <p className="text-md text-gray-600 dark:text-gray-300">High Score: <span className="font-bold">{highScore}</span></p>
      </div>

      {score > highScore && <p className="text-xl font-semibold text-yellow-500">🎉 New High Score! 🎉</p>}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRestart}
          className="flex-1 px-6 py-3 text-lg font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-transform transform hover:scale-105"
        >
          Main Menu
        </button>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex-1 px-6 py-3 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSharing ? 'Sharing...' : 'Share Score'}
        </button>
      </div>
       <button
          onClick={onShowLeaderboard}
          className="w-full px-6 py-3 text-lg font-bold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-transform transform hover:scale-105"
        >
          🏆 View Leaderboard
        </button>
    </div>
  );
};

export default GameOverScreen;