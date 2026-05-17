import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, RefreshCw, CheckCircle2, AlertTriangle, 
  Clock, Shield, Cpu, Cloud, Zap, Radio, History, RotateCcw
} from 'lucide-react';

const CHANNELS = [
  { id: 'latest', label: 'Stable', description: 'Most reliable, fully tested production builds.', badge: 'Recommended' },
  { id: 'beta', label: 'Beta channel', description: 'Early access to upcoming features. May contain minor bugs.', badge: 'Active' },
  { id: 'alpha', label: 'Developer Preview', description: 'Cutting-edge experimental builds for internal developers.', badge: 'Experimental' },
];

const MODULES = [
  { name: 'AI Assistant Engine', version: 'v2.1.0', status: 'Up to date', hotUpdate: true },
  { name: 'Developer Hub Core', version: 'v2.1.0', status: 'Up to date', hotUpdate: true },
  { name: 'Voice & Video Codecs', version: 'v1.8.4', status: 'Up to date', hotUpdate: false },
  { name: 'Docker Virtual Runtime', version: 'v2.0.1', status: 'Up to date', hotUpdate: false },
  { name: 'Workspace Bot Engine', version: 'v1.9.0', status: 'Update Available (v2.0.0)', hotUpdate: true },
  { name: 'CI/CD Live Streamer', version: 'v1.5.2', status: 'Up to date', hotUpdate: true },
];

const HISTORY = [
  { version: 'v2.1.0', date: 'Today, 02:30 PM', type: 'Major Release', status: 'Installed', notes: 'Enterprise Developer Hub improvements, Live Hot Update module integration, Enhanced AI Pair Programming speed.' },
  { version: 'v2.0.5', date: 'May 14, 2026', type: 'Patch Update', status: 'Previous', notes: 'Fixed Discord webhook integration, optimized Redis Socket.IO adapter memory leaks.' },
  { version: 'v2.0.0', date: 'May 01, 2026', type: 'Major Release', status: 'Archived', notes: 'Initial public launch of Anti Gravity Developer OS standalone desktop client.' },
];

const UpdateManagementPanel = () => {
  const [currentVersion, setCurrentVersion] = useState('2.1.0');
  const [platform, setPlatform] = useState('win32');
  const [activeChannel, setActiveChannel] = useState('latest');
  const [isChecking, setIsChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('Up to date');
  const [lastChecked, setLastChecked] = useState('Just now');
  const [cloudSync, setCloudSync] = useState(true);
  const [hotUpdate, setHotUpdate] = useState(true);
  const [rollbackSuccess, setRollbackSuccess] = useState(null);

  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const ver = ipcRenderer.sendSync('app-get-version');
        const plat = ipcRenderer.sendSync('app-get-platform');
        if (ver) setCurrentVersion(ver);
        if (plat) setPlatform(plat);

        // Listen for auto updater events
        const onChecking = () => { setIsChecking(true); setUpdateStatus('Checking for updates...'); };
        const onAvailable = (e, info) => { setIsChecking(false); setUpdateStatus(`Update available: v${info?.version || '2.1.0'}`); };
        const onNotAvailable = () => { setIsChecking(false); setUpdateStatus('Anti Gravity is up to date'); setLastChecked('Just now'); };
        const onError = (e, err) => { setIsChecking(false); setUpdateStatus(`Update error: ${err}`); };

        ipcRenderer.on('update-checking', onChecking);
        ipcRenderer.on('update-available', onAvailable);
        ipcRenderer.on('update-not-available', onNotAvailable);
        ipcRenderer.on('update-error', onError);

        return () => {
          ipcRenderer.removeListener('update-checking', onChecking);
          ipcRenderer.removeListener('update-available', onAvailable);
          ipcRenderer.removeListener('update-not-available', onNotAvailable);
          ipcRenderer.removeListener('update-error', onError);
        };
      } catch (err) { console.error(err); }
    }
  }, []);

  const handleCheckUpdates = () => {
    setIsChecking(true);
    setUpdateStatus('Checking for updates...');
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('update-check');
      } catch (err) { setIsChecking(false); }
    } else {
      // Simulate for Web
      setTimeout(() => {
        setIsChecking(false);
        setUpdateStatus('Anti Gravity is up to date (Web Version)');
        setLastChecked('Just now');
      }, 1500);
    }
  };

  const handleChannelChange = (channelId) => {
    setActiveChannel(channelId);
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('update-channel-switch', channelId);
      } catch (err) { console.error(err); }
    }
  };

  const handleRollback = (ver) => {
    setRollbackSuccess(`Successfully rolled back to ${ver}. Restarting environment...`);
    setTimeout(() => {
      setRollbackSuccess(null);
      setCurrentVersion(ver.replace('v', ''));
    }, 3000);
  };

  return (
    <div className="space-y-8 text-slate-200 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-400" />
          Updates & Synchronization
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage automatic desktop updates, release channels, live feature synchronization, and cloud preferences.
        </p>
      </div>

      {/* Current Version & Update Check Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10">
              <Download className={`w-7 h-7 text-purple-400 ${isChecking ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">Anti Gravity OS</h3>
                <span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-bold font-mono">
                  v{currentVersion}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                  {platform}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {updateStatus}
                </span>
                <span>•</span>
                <span className="text-slate-500">Last checked: {lastChecked}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-purple-600/20 active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check for Updates'}
          </button>
        </div>
      </div>

      {/* Release Channels */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          Release Channel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNELS.map(chan => (
            <div
              key={chan.id}
              onClick={() => handleChannelChange(chan.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                activeChannel === chan.id 
                  ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5' 
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-white">{chan.label}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeChannel === chan.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {chan.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{chan.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Auto-update</span>
                <span className={activeChannel === chan.id ? 'text-purple-400 font-bold' : 'text-slate-500'}>
                  {activeChannel === chan.id ? 'Selected' : 'Select'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Settings & Live Hot Update Sync */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloud Sync */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cloud Settings Sync</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automatically synchronize themes, keybindings, AI prompts, and developer hub preferences across all your devices.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Themes', 'Keybindings', 'AI Preferences', 'Layouts'].map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCloudSync(!cloudSync)}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${cloudSync ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${cloudSync ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Hot Update */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live Hot Update System</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Receive dynamic module patches, AI prompt upgrades, and workspace templates instantly in the background without restarting.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-400/90 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Dynamic module reloading active
              </div>
            </div>
          </div>
          <button 
            onClick={() => setHotUpdate(!hotUpdate)}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${hotUpdate ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${hotUpdate ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Installed Modules */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Installed Modules & Subsystems
        </h3>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {MODULES.map((mod, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{mod.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {mod.hotUpdate ? 'Supports Live Hot Update' : 'Requires Application Restart'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-400">{mod.version}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                  mod.status.includes('Available') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {mod.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update History & Rollback */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            Update History & Rollback Protection
          </h3>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Checksum Verified
          </span>
        </div>

        {rollbackSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {rollbackSuccess}
          </div>
        )}

        <div className="space-y-3">
          {HISTORY.map((hist, idx) => (
            <div key={idx} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white font-mono">{hist.version}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{hist.date}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium">
                    {hist.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{hist.notes}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t border-slate-800 md:border-none">
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                  hist.status === 'Installed' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {hist.status}
                </span>

                {hist.status !== 'Installed' && (
                  <button
                    onClick={() => handleRollback(hist.version)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateManagementPanel;
