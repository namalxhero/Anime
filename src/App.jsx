import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search, X, Star, Tv, Sparkles, Layers, Film } from 'lucide-react';

const ANILIST_API = 'https://graphql.anilist.co';

const QUERY = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title {
      english
      romaji
    }
    coverImage {
      extraLarge
    }
    bannerImage
    description
    episodes
    status
    averageScore
    genres
    relations {
      edges {
        relationType
        node {
          id
          title {
            english
            romaji
          }
          type
        }
      }
    }
  }
}
`;

export default function App() {
  const [currentId, setCurrentId] = useState(21); // Default: One Piece
  const [searchId, setSearchId] = useState('');
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEp, setSelectedEp] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    async function fetchAnime() {
      setLoading(true);
      try {
        const res = await fetch(ANILIST_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { id: Number(currentId) } }),
        });
        const data = await res.json();
        if (data.data?.Media) {
          setAnime(data.data.Media);
        }
      } catch (err) {
        console.error("Error fetching anime:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnime();
  }, [currentId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId) {
      setCurrentId(searchId);
      setSearchId('');
    }
  };

  const handleEpisodeClick = (epNum) => {
    setSelectedEp(epNum);
    setIsPlayerOpen(true);
  };

  const seasons = anime
    ? [
        { id: anime.id, title: anime.title.english || anime.title.romaji },
        ...(anime.relations?.edges
          ?.filter((e) => ['PREQUEL', 'SEQUEL'].includes(e.relationType) && e.node.type === 'ANIME')
          .map((e) => ({
            id: e.node.id,
            title: e.node.title.english || e.node.title.romaji,
          })) || []),
      ]
    : [];

  const episodeList = Array.from({ length: anime?.episodes || 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-red-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Glow Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="p-2 bg-gradient-to-tr from-red-600 to-orange-500 rounded-xl shadow-lg shadow-red-500/20">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-red-400 bg-clip-text text-transparent">
              ANIME<span className="text-red-500">FLIX</span>
            </span>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSearch} 
            className="relative w-full md:w-80"
          >
            <input
              type="number"
              placeholder="Search AniList ID (eg: 21)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-red-500/80 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/20"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </motion.form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full"
            />
            <p className="text-slate-400 text-sm font-medium tracking-wide">Loading Anime Data...</p>
          </div>
        ) : anime ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Banner & Hero Card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-2xl mb-10">
              {anime.bannerImage && (
                <div className="absolute inset-0 h-full w-full">
                  <img src={anime.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-20 filter blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>
              )}

              <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative shrink-0 group cursor-pointer"
                >
                  <img
                    src={anime.coverImage.extraLarge}
                    alt="Cover"
                    className="w-48 h-72 md:w-56 md:h-80 object-cover rounded-2xl shadow-2xl ring-1 ring-slate-700/50"
                  />
                  <div className="absolute inset-0 bg-red-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                    {anime.genres?.slice(0, 3).map((g) => (
                      <span key={g} className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {g}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                    {anime.title.english || anime.title.romaji}
                  </h1>

                  <p 
                    className="text-slate-400 text-sm md:text-base leading-relaxed mb-6 line-clamp-3 max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-semibold">
                    <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3.5 py-1.5 rounded-xl border border-amber-500/20">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{anime.averageScore}% Rating</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                      <Sparkles className="w-4 h-4" />
                      <span>{anime.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Film className="w-4 h-4" />
                      <span>{anime.episodes || 'N/A'} Total Episodes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Season Tabs */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-bold text-white">Seasons & Related Media</h3>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
                {seasons.map((s) => {
                  const isActive = Number(currentId) === Number(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentId(s.id)}
                      className={`relative px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSeasonTab"
                          className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-lg shadow-red-600/30"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Episodes Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-500 fill-red-500" />
                  Episodes
                </h3>
                <span className="text-xs text-slate-500 font-medium">Click an episode to stream</span>
              </div>

              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
              >
                {episodeList.map((ep) => (
                  <motion.button
                    key={ep}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEpisodeClick(ep)}
                    className="group relative p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors mb-1 fill-current" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium">Episode</span>
                    <span className="text-lg font-black text-white">{ep}</span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </main>

      {/* Smooth Animated Video Popup Modal */}
      <AnimatePresence>
        {isPlayerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-red-600/20 text-red-500 rounded-lg text-xs font-black">
                    EP {selectedEp}
                  </span>
                  <h4 className="font-bold text-white text-base truncate max-w-md">
                    {anime?.title?.english || anime?.title?.romaji}
                  </h4>
                </div>
                <button
                  onClick={() => setIsPlayerOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Player Frame */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.2embed.cc/embed/anime/${currentId}/${selectedEp}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

