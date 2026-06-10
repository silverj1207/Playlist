import React, { useState, useRef, useEffect } from 'react';
import { Folder, Play, Pause, SkipBack, SkipForward, Volume2, Music2, Shuffle, Repeat } from 'lucide-react';
import { MOCK_PLAYLISTS } from './data';
import { Playlist, Song } from './types';

export default function App() {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(60);
  const [isRandom, setIsRandom] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (currentSong && currentSong.url && audioRef.current) {
      audioRef.current.src = currentSong.url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.log('Playback error:', e));
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log(e));
    } else {
      handleNextSong();
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextSong = () => {
    if (!activePlaylist || !currentSong) return;
    
    const currentIndex = activePlaylist.songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;

    if (isRandom) {
      let randomIndex = Math.floor(Math.random() * activePlaylist.songs.length);
      if (activePlaylist.songs.length > 1 && randomIndex === currentIndex) {
        randomIndex = (randomIndex + 1) % activePlaylist.songs.length;
      }
      handlePlaySong(activePlaylist.songs[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % activePlaylist.songs.length;
      handlePlaySong(activePlaylist.songs[nextIndex]);
    }
  };

  const handlePrevSong = () => {
    if (!activePlaylist || !currentSong) return;
    
    const currentIndex = activePlaylist.songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;

    if (isRandom) {
      let randomIndex = Math.floor(Math.random() * activePlaylist.songs.length);
      if (activePlaylist.songs.length > 1 && randomIndex === currentIndex) {
        randomIndex = (randomIndex + 1) % activePlaylist.songs.length;
      }
      handlePlaySong(activePlaylist.songs[randomIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + activePlaylist.songs.length) % activePlaylist.songs.length;
      handlePlaySong(activePlaylist.songs[prevIndex]);
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#1d1d1f] flex items-center justify-center p-4 md:p-8"
         style={{
             backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f5f5f7 100%)'
         }}>
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      {/* Main Container */}
      <div className="w-full max-w-5xl glass-panel rounded-[2rem] p-6 lg:p-8 flex flex-col gap-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-3">
            Music
          </h1>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">루mi</div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[400px] lg:h-[450px]">
          
          {/* Folders List (Left Side) */}
          <div className="w-full lg:w-1/3 bg-white/50 backdrop-blur-md rounded-3xl p-4 flex flex-col gap-2 overflow-y-auto border border-white/60 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">Playlists</h3>
            <div className="flex flex-col gap-1">
              {MOCK_PLAYLISTS.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => setActivePlaylist(playlist)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl focus:outline-none transition-all duration-300 ${activePlaylist?.id === playlist.id ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${activePlaylist?.id === playlist.id ? 'bg-rose-50 text-rose-500' : 'bg-gray-100/80 text-gray-400'}`}>
                    <Folder size={20} fill="currentColor" className={activePlaylist?.id === playlist.id ? '' : 'opacity-80'} />
                  </div>
                  <span className={`font-medium truncate ${activePlaylist?.id === playlist.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {playlist.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Songs List (Right Side) */}
          <div className="flex-1 w-full bg-white/50 backdrop-blur-md rounded-3xl p-4 lg:p-6 flex flex-col gap-2 overflow-y-auto border border-white/60 shadow-sm">
            <div className="flex items-center justify-between px-2 mb-4 mt-1">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                {activePlaylist ? activePlaylist.name : 'Select a Playlist'}
              </h3>
              <span className="text-sm text-gray-400 font-medium">
                {activePlaylist && `${activePlaylist.songs.length} Songs`}
              </span>
            </div>
            
            <div className="flex flex-col">
              {!activePlaylist ? (
                <div className="h-48 flex items-center justify-center text-gray-400 font-medium">
                  Choose a playlist to view songs
                </div>
              ) : activePlaylist.songs.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 font-medium">Playlist is empty.</div>
              ) : (
                activePlaylist.songs.map((song, idx) => (
                  <button
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl focus:outline-none transition-colors group ${currentSong?.id === song.id ? 'bg-rose-50 hover:bg-rose-100' : 'hover:bg-white/80'}`}
                  >
                    <div className="w-8 flex justify-center text-gray-400 text-sm font-semibold">
                      {currentSong?.id === song.id && isPlaying ? (
                         <div className="flex items-end gap-[2px] h-3">
                            <div className="eq-bar eq-1"></div>
                            <div className="eq-bar eq-2"></div>
                            <div className="eq-bar eq-3"></div>
                         </div>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 text-left truncate justify-center">
                      <span className={`text-base font-medium truncate ${currentSong?.id === song.id ? 'text-rose-600' : 'text-gray-900 group-hover:text-black'}`}>
                        {song.title}
                      </span>
                      {song.artist && (
                        <span className={`text-sm truncate ${currentSong?.id === song.id ? 'text-rose-400' : 'text-gray-500'}`}>
                          {song.artist}
                        </span>
                      )}
                    </div>
                    {song.duration && <span className="text-sm text-gray-400 font-medium pr-2">{song.duration}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Player Section */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-2 items-center bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 lg:p-6 shadow-sm border border-white">
          
          {/* Now Playing Info (Left) */}
          <div className="flex items-center gap-4 w-full md:w-1/4 min-w-[200px]">
            <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center shrink-0 transition-colors ${currentSong ? 'bg-rose-100' : 'bg-gray-100'}`}>
              <Music2 size={24} className={currentSong ? 'text-rose-500' : 'text-gray-300'} />
            </div>
            <div className="flex flex-col flex-1 text-left truncate justify-center">
              <span className="text-base font-semibold text-gray-900 truncate">
                {currentSong ? currentSong.title : 'Not Playing'}
              </span>
              {(currentSong?.artist || !currentSong) && (
                <span className="text-sm text-gray-500 truncate">
                  {currentSong ? currentSong.artist : '--'}
                </span>
              )}
            </div>
          </div>

          {/* Center Controls & Progress */}
          <div className="flex-1 flex flex-col w-full items-center gap-3">
            {/* Controls */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsRandom(!isRandom)} 
                className={`transition-colors p-1 ${isRandom ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Shuffle size={18} strokeWidth={2.5} />
              </button>
              
              <button onClick={handlePrevSong} className="text-gray-900 hover:opacity-70 transition p-1">
                <SkipBack size={24} fill="currentColor" />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              
              <button onClick={handleNextSong} className="text-gray-900 hover:opacity-70 transition p-1">
                <SkipForward size={24} fill="currentColor" />
              </button>
              
              <button 
                onClick={() => setIsRepeat(!isRepeat)} 
                className={`transition-colors p-1 ${isRepeat ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                 <Repeat size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md flex items-center gap-3 text-xs font-semibold text-gray-400">
               <span className="w-10 text-right">{currentSong ? formatTime(currentTime) : "00:00"}</span>
               <div className="flex-1 relative h-1.5 flex items-center group rounded-full bg-gray-200">
                  <input 
                    type="range" 
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
                    value={progress} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProgress(val);
                      if (audioRef.current && audioRef.current.duration) {
                        audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
                      }
                    }}
                    disabled={!currentSong}
                    min="0"
                    max="100"
                  />
                  <div className="h-full bg-gray-900 rounded-full pointer-events-none transition-all duration-300" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="w-10">{currentSong && duration ? formatTime(duration) : currentSong?.duration || "00:00"}</span>
            </div>
          </div>

          {/* Right Volume Controls */}
          <div className="w-full md:w-1/4 flex items-center justify-end gap-3 text-gray-400 hidden lg:flex">
             <Volume2 size={18} strokeWidth={2.5} />
             <div className="w-24 relative h-1.5 flex items-center group rounded-full bg-gray-200">
                <input 
                  type="range" 
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
                  value={volume} 
                  onChange={(e) => setVolume(Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <div className="h-full bg-gray-900 rounded-full pointer-events-none" style={{ width: `${volume}%` }}></div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
