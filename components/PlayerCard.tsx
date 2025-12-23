
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { generateScoutingReport } from '../services/geminiService';

interface PlayerCardProps {
  player: Player;
  teamLogo?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, teamLogo, size = 'md' }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const isGold = player.overall >= 80;
  const isSilver = player.overall >= 70 && player.overall < 80;
  
  const bgClass = isGold 
    ? 'bg-gradient-to-br from-[#f9d423] via-[#e6b905] to-[#aa771c] text-[#3d2b00] glow-gold' 
    : isSilver 
      ? 'bg-gradient-to-br from-[#e2e2e2] via-[#bdbdbd] to-[#757575] text-[#1a1a1a] glow-silver'
      : 'bg-gradient-to-br from-[#cd7f32] via-[#a0522d] to-[#8b4513] text-[#2d1b00] glow-bronze';

  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-100' : 'scale-90';

  useEffect(() => {
    if (isFlipped && !report && !isLoading) {
      loadReport();
    }
  }, [isFlipped]);

  const loadReport = async () => {
    setIsLoading(true);
    const data = await generateScoutingReport(player);
    setReport(data);
    setIsLoading(false);
  };

  // تم تخصيص المعايير لتوليد شخصية رجل رياضي افتراضياً
  const defaultMaleAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}&top=shortHair,shortHairDreads,shortHairFrizzle,shortHairShaggy,shortHairTheCaesar,shortHairTheCaesarSidePart&mouth=smile,serious&eyes=default&facialHair=blank,beardLight,beardMajestic,moustachesMagnum&backgroundColor=transparent`;

  return (
    <div 
      className={`card-container group perspective-1000 relative w-64 h-[24rem] transition-all duration-500 ease-out transform ${scale} ${isFlipped ? 'is-flipped' : ''} cursor-pointer`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-inner">
        {/* FRONT SIDE - FUT Style */}
        <div className={`card-front fut-card-shape ${bgClass} shadow-2xl relative overflow-hidden`}>
          <div className="fifa-card-shine"></div>
          
          {/* Card Texture/Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] pointer-events-none"></div>
          
          {/* Left Column: Rating, Pos, Flag */}
          <div className="absolute top-10 left-5 flex flex-col items-center gap-1 z-20">
            <span className="text-5xl font-black leading-none tracking-tighter drop-shadow-sm">{player.overall}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{player.position}</span>
            <div className="w-8 h-px bg-current opacity-30 my-1"></div>
            {/* Yemen Flag Small */}
            <div className="flex flex-col gap-0.5 w-6 drop-shadow-sm">
              <div className="h-1 bg-red-600 rounded-sm"></div>
              <div className="h-1 bg-white rounded-sm"></div>
              <div className="h-1 bg-black rounded-sm"></div>
            </div>
            {teamLogo && <span className="text-2xl mt-2 drop-shadow-sm">{teamLogo}</span>}
          </div>

          {/* Player Image */}
          <div className="flex justify-center mt-6 h-44 relative">
             <div className="absolute bottom-4 w-32 h-32 bg-black/10 rounded-full blur-[30px] opacity-40"></div>
             <img 
              src={player.imageUrl || defaultMaleAvatar} 
              alt={player.name}
              className="h-full object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Name Plate */}
          <div className="relative mt-2 z-30 text-center">
            <div className="h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
            <h3 className="text-xl font-black uppercase py-1 tracking-tighter drop-shadow-md px-4 truncate">
              {player.name}
            </h3>
            <div className="h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
          </div>

          {/* Stats Grid - 2 Columns */}
          <div className="mt-2 px-8 flex justify-center gap-6">
            <div className="flex flex-col gap-0.5 text-[11px] font-black italic">
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.pace}</span>
                <span className="opacity-60">PAC</span>
              </div>
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.shooting}</span>
                <span className="opacity-60">SHO</span>
              </div>
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.passing}</span>
                <span className="opacity-60">PAS</span>
              </div>
            </div>
            <div className="w-px h-10 bg-current opacity-20 self-center"></div>
            <div className="flex flex-col gap-0.5 text-[11px] font-black italic">
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.dribbling}</span>
                <span className="opacity-60">DRI</span>
              </div>
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.defending}</span>
                <span className="opacity-60">DEF</span>
              </div>
              <div className="flex gap-2 justify-between w-16">
                <span className="text-sm">{player.stats.physical}</span>
                <span className="opacity-60">PHY</span>
              </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-40 text-[7px] font-black tracking-[0.3em]">
             YEMENI LEAGUE CHENGDU
          </div>
        </div>

        {/* BACK SIDE - FUT Shape Back */}
        <div className="card-back fut-card-shape rounded-none shadow-2xl p-8 border-none flex flex-col items-center justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="text-9xl">🇾🇪</span>
          </div>

          <div className="text-center space-y-4 z-10">
            <div className="w-14 h-14 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-500/20">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="text-red-500 font-black text-[10px] uppercase tracking-widest">إحصائيات البطولة | 赛季统计</h4>
            <div className="h-px w-8 bg-white/10 mx-auto"></div>
          </div>

          <div className="flex-1 w-full space-y-6 mt-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="glass p-3 rounded-2xl text-center">
                   <p className="text-2xl font-black text-white">{player.goals}</p>
                   <p className="text-[9px] opacity-40 font-black">الأهداف | 进球</p>
                </div>
                <div className="glass p-3 rounded-2xl text-center">
                   <p className="text-2xl font-black text-white">{player.assists}</p>
                   <p className="text-[9px] opacity-40 font-black">التمريرات | 助攻</p>
                </div>
             </div>
             
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h5 className="text-[9px] font-black opacity-30 mb-2 text-right">تحليل الأداء | 表现分析</h5>
                {isLoading ? (
                  <div className="py-2 flex justify-center">
                    <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-[11px] text-right font-bold text-slate-400 leading-relaxed italic">
                    "{report || "انقر للتحليل الذكي... | 点击开始AI分析..."}"
                  </p>
                )}
             </div>
          </div>

          <div className="pt-4 w-full z-10 border-t border-white/5">
            <p className="text-[7px] text-center opacity-20 uppercase font-ui tracking-widest">Chengdu Yemeni Student Union • 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
