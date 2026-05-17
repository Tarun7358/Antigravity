import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, CheckCircle2, ArrowRight, Zap, Sparkles } from 'lucide-react';

const UpdateBanner = () => {
  const [updateState, setUpdateState] = useState('idle'); // idle, available, downloading, downloaded, error
  const [updateInfo, setUpdateInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');

        const onAvailable = (e, info) => {
          setUpdateInfo(info || {
            version: '2.1.0',
            releaseNotes: '• Improved Developer Hub modules\n• AI optimization upgrades\n• Enhanced voice performance\n• New collaborative coding features'
          });
          setUpdateState('available');
          setVisible(true);
        };

        const onProgress = (e, progObj) => {
          setProgress(Math.round(progObj?.percent || 0));
          setUpdateState('downloading');
          setVisible(true);
        };

        const onDownloaded = (e, info) => {
          setUpdateInfo(info || { version: '2.1.0' });
          setUpdateState('downloaded');
          setVisible(true);
        };

        const onError = (e, err) => {
          setErrorMsg(err);
          setUpdateState('error');
          setVisible(true);
        };

        ipcRenderer.on('update-available', onAvailable);
        ipcRenderer.on('update-download-progress', onProgress);
        ipcRenderer.on('update-downloaded', onDownloaded);
        ipcRenderer.on('update-error', onError);

        return () => {
          ipcRenderer.removeListener('update-available', onAvailable);
          ipcRenderer.removeListener('update-download-progress', onProgress);
          ipcRenderer.removeListener('update-downloaded', onDownloaded);
          ipcRenderer.removeListener('update-error', onError);
        };
      } catch (err) { console.error(err); }
    }
  }, []);

  const handleInstall = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('update-install');
      } catch (err) { console.error(err); }
    }
  };

  if (!visible || updateState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-auto"
      >
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="flex items-start gap-3.5 min-w-0 w-full md:w-auto">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-0.5 ${
              updateState === 'downloaded' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
            }`}>
              {updateState === 'downloaded' ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <Download className="w-5 h-5 animate-pulse" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  Anti Gravity v{updateInfo?.version || '2.1.0'} {updateState === 'downloaded' ? 'Ready to Install' : updateState === 'downloading' ? 'Downloading Update' : 'Update Available'}
                </h4>
                {updateState === 'available' && (
                  <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> New Release
                  </span>
                )}
              </div>

              {updateState === 'available' && (
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {updateInfo?.releaseNotes || 'Packed with AI optimization upgrades, enhanced developer hub features, and voice performance improvements.'}
                </p>
              )}

              {updateState === 'downloading' && (
                <div className="mt-2 space-y-1.5 w-full max-w-sm">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Background downloading...</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {updateState === 'downloaded' && (
                <p className="text-xs text-slate-300 mt-0.5">
                  The update has been downloaded securely. Restart now to sync the latest features.
                </p>
              )}

              {updateState === 'error' && (
                <p className="text-xs text-rose-400 mt-0.5 truncate">
                  Failed to download update: {errorMsg}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            {updateState === 'downloaded' ? (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 w-full md:w-auto justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Restart & Update
              </button>
            ) : updateState === 'available' ? (
              <button
                onClick={() => setUpdateState('downloading')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 w-full md:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                Download Now
              </button>
            ) : null}

            <button
              onClick={() => setVisible(false)}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateBanner;
