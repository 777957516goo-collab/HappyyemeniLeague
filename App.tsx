
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Player, Team, ViewState, PlayerStats, Match } from './types';
import { INITIAL_TEAMS, POSITIONS } from './constants';
import PlayerCard from './components/PlayerCard';
import LeagueTable from './components/LeagueTable';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [assignments, setAssignments] = useState<Record<string, { teamId: string, position: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const teamImageInputRef = useRef<HTMLInputElement>(null);
  const [activeTeamIdForImage, setActiveTeamIdForImage] = useState<string | null>(null);

  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: '',
    phone: '',
    wechatId: '',
    position: 'MID', 
    imageUrl: '',
    stats: { pace: 75, shooting: 75, passing: 75, dribbling: 75, defending: 75, physical: 75 }
  });

  const allPlayers = useMemo(() => teams.flatMap(t => t.players), [teams]);
  
  const topScorers = useMemo(() => 
    [...allPlayers].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 10), 
    [allPlayers]
  );
  
  const topAssists = useMemo(() => 
    [...allPlayers].filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 10), 
    [allPlayers]
  );

  useEffect(() => {
    const savedTeams = localStorage.getItem('happy_yemen_league_teams_v4');
    const savedPending = localStorage.getItem('happy_yemen_league_pending_v4');
    const savedGallery = localStorage.getItem('happy_yemen_league_gallery_v4');
    
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedPending) setPendingPlayers(JSON.parse(savedPending));
    if (savedGallery) {
      setGalleryImages(JSON.parse(savedGallery));
    } else {
      setGalleryImages([
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1579952318543-7bb54c66b744?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800"
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('happy_yemen_league_teams_v4', JSON.stringify(teams));
    localStorage.setItem('happy_yemen_league_pending_v4', JSON.stringify(pendingPlayers));
    localStorage.setItem('happy_yemen_league_gallery_v4', JSON.stringify(galleryImages));
  }, [teams, pendingPlayers, galleryImages]);

  const calculateOverall = (stats: PlayerStats): number => {
    const values = Object.values(stats);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت. | 图片太大，请选择2MB以下的图片。");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlayer(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeTeamIdForImage) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTeamField(activeTeamIdForImage, 'teamImageUrl', reader.result as string);
        setActiveTeamIdForImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryImage = (index: number) => {
    if (confirm("هل تريد حذف هذه الصورة من المعرض؟")) {
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTeamField = (teamId: string, field: keyof Team, value: any) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, [field]: value } : t));
  };

  const updatePlayerField = (teamId: string, playerId: string, field: keyof Player, value: any) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map(p => p.id === playerId ? { ...p, [field]: value } : p)
        };
      }
      return t;
    }));
  };

  const addManualPlayer = (teamId: string) => {
    const newP: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'لاعب جديد | 新球员',
      position: 'MID',
      teamId: teamId,
      stats: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
      overall: 50,
      goals: 0,
      assists: 0
    };
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: [...t.players, newP] } : t));
  };

  const handleEditStatChange = (stat: keyof PlayerStats, val: number) => {
    if (!editingPlayer) return;
    const updatedStats = { ...editingPlayer.stats, [stat]: Math.min(99, Math.max(1, val)) };
    setEditingPlayer({
      ...editingPlayer,
      stats: updatedStats,
      overall: calculateOverall(updatedStats)
    });
  };

  const handleRegisterStatChange = (stat: keyof PlayerStats, val: number) => {
    const updatedStats = { ...newPlayer.stats!, [stat]: Math.min(99, Math.max(1, val)) };
    setNewPlayer({
      ...newPlayer,
      stats: updatedStats
    });
  };

  const saveEditedPlayer = () => {
    if (!editingPlayer) return;
    setTeams(prev => prev.map(t => {
      if (t.id === editingPlayer.teamId) {
        return {
          ...t,
          players: t.players.map(p => p.id === editingPlayer.id ? editingPlayer : p)
        };
      }
      return t;
    }));
    setEditingPlayer(null);
  };

  const removePlayer = (teamId: string, playerId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا اللاعب؟ | 确定要删除这位球员吗？")) return;
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t));
  };

  const assignPlayer = (playerId: string) => {
    const player = pendingPlayers.find(p => p.id === playerId);
    const assignment = assignments[playerId];
    if (!player || !assignment) return;
    
    const targetTeam = teams.find(t => t.id === assignment.teamId);
    if (targetTeam && targetTeam.players.length >= 7) {
      if (!confirm("هذا الفريق لديه 7 لاعبين بالفعل، هل تريد إضافة اللاعب على أي حال؟ | 该队已有7名球员，仍要添加吗？")) return;
    }

    setTeams(prev => prev.map(t => 
      t.id === assignment.teamId 
        ? { ...t, players: [...t.players, { ...player, teamId: assignment.teamId, position: assignment.position }] } 
        : t
    ));
    setPendingPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const deletePendingPlayer = (playerId: string) => {
    if (!confirm("هل تريد حذف هذا الطلب نهائياً؟ | 确定要永久删除此申请吗？")) return;
    setPendingPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const getTeamById = (id: string) => teams.find(t => t.id === id);

  const previewPlayer: Player = {
    id: 'preview',
    name: newPlayer.name || 'الاسم | 姓名',
    position: newPlayer.position || 'MID',
    teamId: 'none',
    imageUrl: newPlayer.imageUrl,
    stats: newPlayer.stats as PlayerStats,
    overall: calculateOverall(newPlayer.stats as PlayerStats),
    goals: 0,
    assists: 0
  };

  const statLabels: Record<string, string> = {
    pace: 'السرعة | 速度',
    shooting: 'التسديد | 射门',
    passing: 'التمرير | 传球',
    dribbling: 'المراوغة | 盘带',
    defending: 'الدفاع | 防守',
    physical: 'البدني | 体能'
  };

  return (
    <div className="min-h-screen selection:bg-red-500 selection:text-white pb-20 md:pb-0">
      <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-white/5 px-6 md:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-red-800 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform">🇾🇪</div>
          <div className="text-right">
            <h1 className="text-xl font-black font-brand leading-none text-red-500">الدوري اليمني السعيد</h1>
            <span className="text-[9px] opacity-40 font-ui uppercase tracking-widest leading-tight block">Happy Yemen League | 幸福也门联赛</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-8 items-center font-bold text-[10px] uppercase tracking-[0.2em] font-ui">
          <button onClick={() => setView('stats')} className={`hover:text-red-500 transition-colors ${view === 'stats' ? 'text-red-500' : ''}`}>الإحصائيات | 数据</button>
          <button onClick={() => setView('table')} className={`hover:text-red-500 transition-colors ${view === 'table' ? 'text-red-500' : ''}`}>الترتيب | 积分榜</button>
          <button onClick={() => setView('teams')} className={`hover:text-red-500 transition-colors ${view === 'teams' ? 'text-red-500' : ''}`}>الفرق | 球队</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setView('admin')} className={`p-2 rounded-xl transition-all ${view === 'admin' ? 'bg-blue-600/20 text-blue-400' : 'opacity-40 hover:opacity-100'}`}>
            <span className="text-xl font-bold">⚙️</span>
          </button>
          <button onClick={() => setView('register')} className="bg-white text-black font-black px-6 py-2 rounded-full text-[10px] hover:bg-red-600 hover:text-white transition-all transform hover:scale-105">
            سجل الآن | 立即注册
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-32">
        {view === 'landing' && (
          <div className="space-y-40 animate-fade">
             {/* Hero Section */}
             <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 text-right space-y-10">
                <div className="inline-block bg-red-600/10 text-red-500 px-6 py-2 rounded-full text-xs font-black tracking-widest mb-4 border border-red-500/20">
                  تشنغدو 2025 | 成都 2025
                </div>
                <h2 className="text-7xl md:text-9xl font-black leading-[0.95] font-brand">
                  الدوري اليمني السعيد <br/>
                  <span className="text-red-600">في تشنغدو</span>
                </h2>
                <p className="text-xl text-white/50 leading-relaxed max-w-xl font-medium">
                  نحن هنا لنصنع الفرح ونحتفي بالمهارة. "الدوري اليمني السعيد" في مدينة تشنغدو هو ملتقى القلوب الرياضية في الغربة.
                  <br/>
                  <span className="text-sm">幸福也门足球联赛管理平台。我们在海外通过体育传递快乐。</span>
                </p>
                <div className="flex gap-6 justify-end pt-6">
                  <button onClick={() => setView('register')} className="bg-red-600 text-white font-black px-12 py-6 rounded-[2rem] text-xl shadow-2xl shadow-red-600/30 hover:scale-105 transition-transform">سجل الآن | 立即注册</button>
                  <button onClick={() => setView('table')} className="glass text-white font-bold px-12 py-6 rounded-[2rem] text-xl hover:bg-white/10 transition-colors">جدول الترتيب | 积分榜</button>
                </div>
              </div>
              <div className="lg:w-1/2 relative group">
                <div className="absolute -inset-4 bg-red-600/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <img src="https://raw.githubusercontent.com/StackBlitz-Staff/stackblitz-images/main/yemen-team-chengdue.jpg" className="relative rounded-[4rem] shadow-2xl border-4 border-white/5 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 w-full object-cover aspect-[4/3]" alt="The Yemen Team in Chengdu" />
                <div className="absolute -bottom-10 -left-10 glass p-8 rounded-[2.5rem] border-l-4 border-red-600 animate-bounce duration-[3000ms]">
                   <p className="text-4xl font-black">6</p>
                   <p className="text-[10px] opacity-40 font-bold uppercase">الفرق المتنافسة | 参赛球队</p>
                </div>
              </div>
            </div>

            {/* League Stats Overview */}
            <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
               {[
                 {n: '6', t: 'فرق متنافسة', c: '参赛球队'},
                 {n: '1', t: 'بطل مرتقب', c: '年度冠军'}
               ].map((stat, i) => (
                 <div key={i} className="glass p-12 rounded-[3rem] text-center min-w-[240px] space-y-4 border-b-4 border-transparent hover:border-red-600 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">⚽</div>
                    <p className="text-7xl font-black group-hover:scale-110 transition-transform">{stat.n}</p>
                    <div>
                      <p className="font-bold text-lg">{stat.t}</p>
                      <p className="text-xs opacity-40 uppercase tracking-widest">{stat.c}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Moments Gallery Section - Admin Managed */}
            <div className="space-y-16">
               <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black font-brand">لقطات من الميدان | 赛场瞬间</h3>
                  <p className="text-sm opacity-50 uppercase tracking-[0.3em]">Captured by Happy Yemen League</p>
                  <div className="h-1 w-20 bg-red-600 mx-auto rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-[2.5rem] aspect-[4/5] shadow-2xl transition-all hover:-translate-y-2">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={`Gallery ${idx}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="font-black text-xl italic uppercase">Yemenis in Chengdu | اليمن في تشنغدو</p>
                      </div>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30 italic bg-white/5 rounded-[3rem]">
                       لا توجد صور حالياً. يرجى من المسؤول رفع صور الميدان من لوحة التحكم. <br/> 暂无照片，请管理员上传赛场照片。
                    </div>
                  )}
               </div>
            </div>

            {/* Features Section */}
            <div className="space-y-16">
               <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black font-brand">مميزات النظام | 系统特色</h3>
                  <div className="h-1 w-20 bg-red-600 mx-auto rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="glass p-12 rounded-[3rem] space-y-6 hover:-translate-y-2 transition-transform">
                     <div className="text-5xl">🃏</div>
                     <h4 className="text-2xl font-black">بطاقات فيفا | 球员卡</h4>
                     <p className="text-sm opacity-50 leading-relaxed">كل لاعب يحصل على بطاقة رقمية بأسلوب FUT تعرض مهاراته وإحصائياته الحقيقية في الملعب.</p>
                  </div>
                  <div className="glass p-12 rounded-[3rem] space-y-6 hover:-translate-y-2 transition-transform border-t-4 border-blue-500/30">
                     <div className="text-5xl">🤖</div>
                     <h4 className="text-2xl font-black">تحليل AI | 智能分析</h4>
                     <p className="text-sm opacity-50 leading-relaxed">استخدام الذكاء الاصطناعي لتحليل أداء اللاعبين وتقديم تقارير فنية دورية عن مستواهم.</p>
                  </div>
                  <div className="glass p-12 rounded-[3rem] space-y-6 hover:-translate-y-2 transition-transform">
                     <div className="text-5xl">🏆</div>
                     <h4 className="text-2xl font-black">متابعة حية | 实时追踪</h4>
                     <p className="text-sm opacity-50 leading-relaxed">جدول ترتيب محدث لحظياً، قائمة الهدافين، وصناع اللعب للبقاء في قلب الحدث.</p>
                  </div>
               </div>
            </div>

            {/* How to Join */}
            <div className="glass p-16 rounded-[4rem] relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-black opacity-30"></div>
               <div className="absolute -right-20 -bottom-20 opacity-5 text-[20rem] rotate-12 transition-transform group-hover:rotate-6 duration-1000">⚽</div>
               <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                  <div className="text-right space-y-4">
                     <h3 className="text-4xl font-black font-brand">هل أنت جاهز للميدان؟</h3>
                     <p className="text-xl opacity-60">سجل بياناتك الآن واحصل على بطاقتك الرسمية في الدوري.</p>
                     <p className="text-sm opacity-40 uppercase">Ready to join the field? Register now.</p>
                  </div>
                  <button onClick={() => setView('register')} className="bg-white text-black font-black px-16 py-8 rounded-[2.5rem] text-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">
                     ابدأ التسجيل | 开始注册
                  </button>
               </div>
            </div>
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-20 animate-fade text-right">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black font-brand">إحصائيات المبدعين | 球员数据统计</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <h3 className="text-3xl font-black font-brand border-r-8 border-red-600 pr-4">الهدافون | 射手榜</h3>
                  <div className="space-y-4">
                    {topScorers.map((p, i) => (
                      <div key={p.id} className="glass p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <span className="text-2xl font-black opacity-20 italic">#{i+1}</span>
                           <div className="text-right">
                             <p className="font-bold text-xl">{p.name}</p>
                             <p className="text-xs opacity-40">{getTeamById(p.teamId)?.name}</p>
                           </div>
                        </div>
                        <span className="text-3xl font-black text-red-500">{p.goals} <small className="text-xs">هدف | 进球</small></span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-8">
                  <h3 className="text-3xl font-black font-brand border-r-8 border-blue-600 pr-4">صناع اللعب | 助攻榜</h3>
                  <div className="space-y-4">
                    {topAssists.map((p, i) => (
                      <div key={p.id} className="glass p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <span className="text-2xl font-black opacity-20 italic">#{i+1}</span>
                           <div className="text-right">
                             <p className="font-bold text-xl">{p.name}</p>
                             <p className="text-xs opacity-40">{getTeamById(p.teamId)?.name}</p>
                           </div>
                        </div>
                        <span className="text-3xl font-black text-blue-500">{p.assists} <small className="text-xs">أسيست | 助攻</small></span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-6xl mx-auto animate-fade">
             {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto glass p-16 rounded-[4rem] text-center space-y-10">
                <h2 className="text-3xl font-black font-brand">دخول المسؤول | 管理员登录</h2>
                <form className="space-y-6" onSubmit={e => { 
                  e.preventDefault(); 
                  if(adminPassword === 'yemenystudentunion') setIsAdminAuthenticated(true); 
                  else alert('كلمة مرور خاطئة | 密码错误'); 
                }}>
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-white/5 p-5 rounded-2xl text-center text-xl border border-white/5 outline-none" placeholder="كلمة المرور | 密码" />
                  <button className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl">دخول | 登录</button>
                </form>
              </div>
            ) : (
              <div className="space-y-16">
                 <div className="flex justify-between items-center glass p-8 rounded-[2.5rem] border-b-4 border-blue-600">
                    <button onClick={() => setIsAdminAuthenticated(false)} className="bg-red-500/10 text-red-500 px-8 py-3 rounded-2xl text-xs font-black">خروج | 退出</button>
                    <h2 className="text-3xl font-black font-brand text-right">لوحة التحكم الكاملة | 系统管理后台</h2>
                 </div>

                 {/* Admin Section: Gallery Management */}
                 <div className="space-y-8 text-right bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <h3 className="text-2xl font-black border-r-8 border-green-500 pr-4">إدارة معرض صور الصفحة الرئيسية | 首页画廊管理</h3>
                    <p className="text-sm opacity-50">يمكنك هنا رفع صور الميدان الجديدة أو حذف الصور القديمة لتظهر في الصفحة الرئيسية.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                       {galleryImages.map((img, idx) => (
                         <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                           <img src={img} className="w-full h-full object-cover" />
                           <button 
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity"
                           >
                             <span className="text-xl">🗑️</span>
                             <span className="font-black text-white text-[10px]">حذف الصورة | 删除</span>
                           </button>
                         </div>
                       ))}
                       <button 
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-500/5 transition-all group"
                       >
                         <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
                         <span className="text-[10px] font-black opacity-40 mt-2">إضافة لقطة ميدان | 添加</span>
                         <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-8 text-right">
                    <h3 className="text-2xl font-black border-r-8 border-yellow-500 pr-4 flex items-center gap-4">
                      <span>طلبات الانضمام الجديدة | 新加入申请</span>
                      <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs">{pendingPlayers.length}</span>
                    </h3>
                    
                    {pendingPlayers.length === 0 ? (
                      <div className="glass p-12 rounded-[2.5rem] text-center opacity-30 italic">لا توجد طلبات جديدة حالياً | 暂无新申请</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingPlayers.map(p => (
                          <div key={p.id} className="glass p-8 rounded-[2.5rem] space-y-6 border-t-4 border-yellow-500/40">
                             <div className="flex justify-between items-start">
                                <button onClick={() => deletePendingPlayer(p.id)} className="bg-red-500/10 text-red-500 p-2 rounded-xl text-[10px] hover:bg-red-500/20">رفض الطلب | 拒绝</button>
                                <div className="text-right">
                                  <p className="text-xl font-black">{p.name}</p>
                                  <p className="text-sm opacity-50">📱 {p.phone}</p>
                                  <p className="text-sm opacity-50">💬 {p.wechatId}</p>
                                </div>
                             </div>
                             
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[10px] opacity-40">المركز (يحدده المسؤول) | 位置（管理员指定）</label>
                                      <select 
                                        className="w-full bg-white/5 p-3 rounded-xl text-xs outline-none"
                                        value={assignments[p.id]?.position || 'MID'}
                                        onChange={e => setAssignments({ ...assignments, [p.id]: { teamId: assignments[p.id]?.teamId || teams[0].id, position: e.target.value } })}
                                      >
                                        {POSITIONS.map(pos => <option key={pos.code} value={pos.code} className="bg-slate-900">{pos.label}</option>)}
                                      </select>
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] opacity-40">الفريق المستهدف | 目标球队</label>
                                      <select 
                                        className="w-full bg-white/5 p-3 rounded-xl text-xs outline-none"
                                        value={assignments[p.id]?.teamId || teams[0].id}
                                        onChange={e => setAssignments({ ...assignments, [p.id]: { teamId: e.target.value, position: assignments[p.id]?.position || 'MID' } })}
                                      >
                                        {teams.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                                      </select>
                                   </div>
                                </div>
                                <button 
                                  onClick={() => assignPlayer(p.id)}
                                  className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl hover:bg-yellow-400 transition-all shadow-lg"
                                >
                                  تأكيد قبول اللاعب وتعيينه | 确认接收并分配
                                </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <div className="space-y-12">
                    <h3 className="text-2xl font-black border-r-8 border-blue-600 pr-4 text-right">إدارة الفرق واللاعبين المسجلين | 球队及球员管理</h3>
                    {teams.map(team => (
                      <div key={team.id} className="glass p-10 rounded-[3rem] space-y-10 border border-white/5">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
                           <div className="flex flex-col gap-4 flex-1">
                              <div className="flex gap-4">
                                <input className="w-20 bg-black/40 p-4 rounded-2xl text-3xl text-center outline-none border border-white/5" value={team.logo} onChange={e => updateTeamField(team.id, 'logo', e.target.value)} />
                                <input className="flex-1 bg-black/40 p-4 rounded-2xl text-xl font-black text-right outline-none border border-white/5" value={team.name} onChange={e => updateTeamField(team.id, 'name', e.target.value)} />
                              </div>
                              <div className="flex gap-4 items-start">
                                 <textarea 
                                    className="flex-1 bg-black/40 p-4 rounded-2xl text-xs text-right outline-none border border-white/5 h-20" 
                                    placeholder="وصف الفريق... | 球队简介..."
                                    value={team.description || ''}
                                    onChange={e => updateTeamField(team.id, 'description', e.target.value)}
                                  />
                                  <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative group">
                                     {team.teamImageUrl ? (
                                       <>
                                         <img src={team.teamImageUrl} className="w-full h-full object-cover rounded-2xl" />
                                         <button onClick={() => updateTeamField(team.id, 'teamImageUrl', '')} className="absolute -top-2 -left-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] font-black">×</button>
                                       </>
                                     ) : (
                                       <span className="text-2xl opacity-20">🖼️</span>
                                     )}
                                     <button 
                                        onClick={() => { setActiveTeamIdForImage(team.id); teamImageInputRef.current?.click(); }}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity text-[8px] font-black"
                                      >
                                        تغيير الصورة | 更换
                                      </button>
                                  </div>
                              </div>
                           </div>
                           <div className="grid grid-cols-5 gap-2 text-center">
                              {[
                                {k: 'points', l: 'نقاط|分'}, 
                                {k: 'played', l: 'لعب|场'}, 
                                {k: 'won', l: 'فوز|胜'}, 
                                {k: 'drawn', l: 'تعادل|平'}, 
                                {k: 'lost', l: 'خسارة|负'}
                              ].map(f => (
                                <div key={f.k} className="space-y-1">
                                  <label className="text-[8px] opacity-40 uppercase">{f.l}</label>
                                  <input type="number" className="w-12 bg-white/5 p-2 rounded-lg text-center" value={(team as any)[f.k]} onChange={e => updateTeamField(team.id, f.k as any, parseInt(e.target.value) || 0)} />
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {team.players.map(p => (
                             <div key={p.id} className="bg-white/5 p-6 rounded-3xl space-y-4 border border-white/5 relative group">
                                <div className="flex justify-between items-start">
                                   <div className="flex gap-2">
                                      <button onClick={() => removePlayer(team.id, p.id)} className="bg-red-500/10 text-red-500 p-2 rounded-xl text-xs hover:bg-red-500/20">حذف | 删除</button>
                                      <button onClick={() => setEditingPlayer(p)} className="bg-amber-500/10 text-amber-500 p-2 rounded-xl text-xs hover:bg-amber-500/20">تعديل المهارات | 修改技能</button>
                                   </div>
                                   <div className="text-right flex-1">
                                      <input className="w-full bg-transparent text-right font-black text-lg outline-none focus:bg-white/5 rounded px-2" value={p.name} onChange={e => updatePlayerField(team.id, p.id, 'name', e.target.value)} />
                                      <select className="bg-transparent text-right text-xs opacity-40 outline-none" value={p.position} onChange={e => updatePlayerField(team.id, p.id, 'position', e.target.value)}>
                                        {POSITIONS.map(pos => <option key={pos.code} value={pos.code}>{pos.label}</option>)}
                                      </select>
                                      {p.phone && <p className="text-[10px] opacity-30">هاتف | 电话: {p.phone}</p>}
                                      {p.wechatId && <p className="text-[10px] opacity-30">ويتشات | 微信: {p.wechatId}</p>}
                                   </div>
                                </div>
                                <div className="flex justify-end gap-6 border-t border-white/5 pt-4">
                                   <div className="flex flex-col items-center">
                                      <span className="text-[10px] opacity-30">أهداف | 进球</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => updatePlayerField(team.id, p.id, 'goals', Math.max(0, p.goals - 1))} className="w-6 h-6 bg-white/5 rounded">-</button>
                                        <span className="font-black">{p.goals}</span>
                                        <button onClick={() => updatePlayerField(team.id, p.id, 'goals', p.goals + 1)} className="w-6 h-6 bg-white/5 rounded">+</button>
                                      </div>
                                   </div>
                                   <div className="flex flex-col items-center">
                                      <span className="text-[10px] opacity-30">أسيست | 助攻</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => updatePlayerField(team.id, p.id, 'assists', Math.max(0, p.assists - 1))} className="w-6 h-6 bg-white/5 rounded">-</button>
                                        <span className="font-black">{p.assists}</span>
                                        <button onClick={() => updatePlayerField(team.id, p.id, 'assists', p.assists + 1)} className="w-6 h-6 bg-white/5 rounded">+</button>
                                      </div>
                                   </div>
                                </div>
                             </div>
                           ))}
                           <button onClick={() => addManualPlayer(team.id)} className="border-2 border-dashed border-white/10 p-6 rounded-3xl opacity-40 hover:opacity-100 transition-all font-black">+ إضافة لاعب جديد | 添加新球员</button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
            <input ref={teamImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleTeamImageUpload} />
          </div>
        )}

        {editingPlayer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="glass w-full max-w-xl rounded-[3rem] p-12 space-y-10 animate-fade">
              <h3 className="text-3xl font-black font-brand text-right">تعديل مهارات {editingPlayer.name} <br/> <small>修改技能数据</small></h3>
              <div className="grid grid-cols-2 gap-10">
                {Object.entries(editingPlayer.stats).map(([k, v]) => (
                  <div key={k} className="space-y-2">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-amber-500">{v}</span>
                      <span className="uppercase text-[10px] opacity-40">{statLabels[k]}</span>
                    </div>
                    <input type="range" min="1" max="99" value={v} onChange={e => handleEditStatChange(k as any, parseInt(e.target.value))} className="w-full accent-red-600" />
                  </div>
                ))}
              </div>
              <div className="text-center">
                 <span className="text-7xl font-black text-amber-500">{editingPlayer.overall}</span>
                 <p className="opacity-40 uppercase font-black text-xs">التقييم العام الجديد | 新综合评分</p>
              </div>
              <button onClick={saveEditedPlayer} className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all">حفظ البيانات | 保存数据</button>
              <button onClick={() => setEditingPlayer(null)} className="w-full text-white/30 font-bold">إلغاء | 取消</button>
            </div>
          </div>
        )}

        {view === 'teams' && (
          <div className="space-y-32 animate-fade">
            {teams.map(t => (
              <div key={t.id} className="space-y-16">
                {/* Team Hero Section */}
                <div className="glass rounded-[4rem] p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 border-b-8 border-red-600 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-black opacity-30"></div>
                   <div className="absolute -right-20 -bottom-20 opacity-5 text-[25rem] transition-transform group-hover:rotate-12 duration-1000 select-none">{t.logo}</div>
                   
                   {/* Prominent Logo/Image */}
                   <div className="relative">
                      {t.teamImageUrl ? (
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-[3rem] overflow-hidden shadow-inner border border-white/10 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                           <img src={t.teamImageUrl} className="w-full h-full object-cover" alt={t.name} />
                        </div>
                      ) : (
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-[3rem] flex items-center justify-center text-8xl md:text-9xl shadow-inner border border-white/10 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                          {t.logo}
                        </div>
                      )}
                      <div className="absolute -bottom-4 -right-4 bg-red-600 text-white px-6 py-2 rounded-2xl font-black text-xl shadow-lg">
                        #{teams.indexOf(t) + 1}
                      </div>
                   </div>

                   {/* Team Info */}
                   <div className="flex-1 text-right space-y-6 relative z-10">
                      <h3 className="text-5xl md:text-7xl font-black font-brand tracking-tighter">{t.name}</h3>
                      <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl ml-auto italic">
                        {t.description || "لا يوجد وصف متوفر لهذا الفريق حالياً. فريق يمني عريق يشارك في دوري تشنغدو السعيد."}
                      </p>
                      
                      {/* Win/Loss Record Badges */}
                      <div className="flex justify-end gap-4 pt-4">
                         <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl text-center">
                            <p className="text-3xl font-black text-green-500">{t.won}</p>
                            <p className="text-[10px] uppercase font-bold opacity-50">فوز | 胜</p>
                         </div>
                         <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-2xl text-center">
                            <p className="text-3xl font-black text-yellow-500">{t.drawn}</p>
                            <p className="text-[10px] uppercase font-bold opacity-50">تعادل | 平</p>
                         </div>
                         <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl text-center">
                            <p className="text-3xl font-black text-red-500">{t.lost}</p>
                            <p className="text-[10px] uppercase font-bold opacity-50">خسارة | 负</p>
                         </div>
                         <div className="bg-blue-500/10 border border-blue-500/20 px-8 py-3 rounded-2xl text-center">
                            <p className="text-3xl font-black text-blue-400">{t.points}</p>
                            <p className="text-[10px] uppercase font-bold opacity-50">نقاط | 积分</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Player Grid */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4 justify-end border-r-4 border-white/10 pr-6">
                      <div className="text-right">
                         <h4 className="text-2xl font-black">قائمة المحاربين</h4>
                         <p className="text-xs opacity-40 uppercase tracking-widest">Team Squad | 球队阵容</p>
                      </div>
                      <span className="text-4xl">🛡️</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                      {t.players.map(p => (
                        <div key={p.id} className="flex justify-center transform hover:scale-105 transition-transform">
                          <PlayerCard player={p} teamLogo={t.logo} size="md" />
                        </div>
                      ))}
                      {t.players.length === 0 && (
                        <div className="col-span-full py-20 text-center glass rounded-[3rem] opacity-30 italic">
                          لم يتم تسجيل لاعبين في هذا الفريق بعد. <br/> 暂无球员注册。
                        </div>
                      )}
                   </div>
                </div>
                
                {/* Section Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            ))}
          </div>
        )}

        {view === 'table' && <div className="animate-fade"><LeagueTable teams={teams} /></div>}
        
        {view === 'register' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade">
            <h2 className="text-5xl font-black font-brand text-center mb-10">بطاقتك في الميدان | 你的球场名片</h2>
            
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Form Side */}
              <div className="lg:w-3/5 glass p-10 rounded-[3rem] space-y-10 order-2 lg:order-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 text-right md:col-span-2">
                      <label className="text-xs opacity-50 font-black">الاسم الكامل | 球员全名</label>
                      <input value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} placeholder="الاسم كما سيظهر على البطاقة | 球员卡姓名" className="w-full bg-white/5 p-5 rounded-2xl outline-none text-right border border-white/5 focus:border-red-600 transition-all font-bold" />
                  </div>
                  <div className="space-y-2 text-right">
                      <label className="text-xs opacity-50 font-black">رقم الهاتف الصيني | 手机号</label>
                      <input value={newPlayer.phone} onChange={e => setNewPlayer({...newPlayer, phone: e.target.value})} placeholder="1xx xxxx xxxx" className="w-full bg-white/5 p-5 rounded-2xl outline-none text-right border border-white/5 focus:border-red-600 transition-all" />
                  </div>
                  <div className="space-y-2 text-right">
                      <label className="text-xs opacity-50 font-black">معرف الويتشات | 微信ID</label>
                      <input value={newPlayer.wechatId} onChange={e => setNewPlayer({...newPlayer, wechatId: e.target.value})} placeholder="ID or Phone" className="w-full bg-white/5 p-5 rounded-2xl outline-none text-right border border-white/5 focus:border-red-600 transition-all" />
                  </div>
                </div>

                {/* Profile Image Section */}
                <div className="space-y-4 text-right pt-4 border-t border-white/5">
                   <h3 className="text-xl font-black border-r-4 border-red-600 pr-4">الصورة الشخصية | 个人照片</h3>
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full md:w-auto flex-1 h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition-all group"
                      >
                         <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                         <span className="text-xs font-bold opacity-50 group-hover:opacity-100">انقر لرفع صورتك للبطاقة | 点击上传照片</span>
                         <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </div>
                      {newPlayer.imageUrl && (
                        <div className="relative group">
                           <img src={newPlayer.imageUrl} className="w-24 h-24 rounded-2xl object-cover border-2 border-red-600 shadow-xl" />
                           <button onClick={() => setNewPlayer(p => ({...p, imageUrl: ''}))} className="absolute -top-2 -left-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-black shadow-lg">×</button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-8 pt-6 border-t border-white/10">
                   <h3 className="text-xl font-black text-right border-r-4 border-red-600 pr-4">حدد مهاراتك | 选择你的技能</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      {newPlayer.stats && Object.entries(newPlayer.stats).map(([stat, val]) => (
                        <div key={stat} className="space-y-3">
                          <div className="flex justify-between items-center px-2">
                             <span className="text-red-500 font-black text-xl">{val}</span>
                             <span className="text-[10px] uppercase font-black opacity-40">{statLabels[stat]}</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="99" 
                            value={val} 
                            onChange={e => handleRegisterStatChange(stat as any, parseInt(e.target.value))}
                            className="w-full accent-red-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      ))}
                   </div>
                </div>

                <button onClick={() => {
                  if(!newPlayer.name) return alert("الاسم مطلوب | 姓名是必填项");
                  if(!newPlayer.phone) return alert("رقم الهاتف مطلوب | 手机号是必填项");
                  const p: Player = {
                    ...previewPlayer,
                    id: Math.random().toString(36).substr(2, 9),
                    phone: newPlayer.phone,
                    wechatId: newPlayer.wechatId
                  };
                  setPendingPlayers(prev => [...prev, p]);
                  setAssignments(prev => ({...prev, [p.id]: { teamId: teams[0].id, position: 'MID' }}));
                  alert("تم التقديم بنجاح! سنتواصل معك قريباً. | 申请已提交！我们会尽快联系您。");
                  setView('landing');
                  setNewPlayer({ name: '', phone: '', wechatId: '', position: 'MID', imageUrl: '', stats: { pace: 75, shooting: 75, passing: 75, dribbling: 75, defending: 75, physical: 75 } });
                }} className="w-full bg-red-600 py-6 rounded-[2.5rem] font-black text-2xl hover:bg-red-700 transition-all transform active:scale-95 shadow-2xl shadow-red-600/30">إرسال طلب الانضمام | 提交申请</button>
              </div>

              {/* Preview Side */}
              <div className="lg:w-2/5 flex flex-col items-center justify-center space-y-8 sticky top-32 order-1 lg:order-2">
                 <div className="text-center space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-black">Live Preview | 实时预览</p>
                    <div className="h-px w-12 bg-red-600 mx-auto"></div>
                 </div>
                 <PlayerCard player={previewPlayer} size="lg" />
                 <p className="text-xs opacity-30 text-center italic max-w-xs leading-relaxed">تأكد من اختيار مهاراتك بدقة، فالمسؤولون سيقومون بمراجعة طلبك وتحديد فريقك بناءً على هذه البيانات. <br/> 请准确填写，管理员将根据此数据进行分配。</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 py-4 px-4 md:hidden z-[100] flex justify-around items-center rounded-t-[2.5rem]">
        <button onClick={() => setView('landing')} className={`text-2xl p-2 rounded-2xl ${view === 'landing' ? 'bg-red-600/20 text-red-500' : 'opacity-30'}`}>🏠</button>
        <button onClick={() => setView('stats')} className={`text-2xl p-2 rounded-2xl ${view === 'stats' ? 'bg-red-600/20 text-red-500' : 'opacity-30'}`}>📊</button>
        <button onClick={() => setView('teams')} className={`text-2xl p-2 rounded-2xl ${view === 'teams' ? 'bg-red-600/20 text-red-500' : 'opacity-30'}`}>🛡️</button>
        <button onClick={() => setView('admin')} className={`text-2xl p-2 rounded-2xl ${view === 'admin' ? 'bg-blue-600/20 text-blue-400' : 'opacity-30'}`}>⚙️</button>
      </footer>
    </div>
  );
};

export default App;
