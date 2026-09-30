import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  Image as ImageIcon,
  Camera,
  Keyboard,
  X,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface PlateScannerProps {
  onBack: () => void;
  onPlateDetected: (plate: string) => void;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ onBack, onPlateDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [torch, setTorch] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualPlateInput, setManualPlateInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [ocrStatus, setOcrStatus] = useState<string>('');

  // Start Camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setErrorMsg('');
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        // Check torch support
        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities?.torch) {
          setHasTorch(true);
        }
      } catch (err: any) {
        console.warn('Camera access issue:', err);
        setErrorMsg('Camera access is not permitted or unavailable. Use photo upload or manual entry.');
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle flashlight
  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const newTorchState = !torch;
      await (track as any).applyConstraints({
        advanced: [{ torch: newTorchState }]
      });
      setTorch(newTorchState);
    } catch (e) {
      console.warn('Torch not supported', e);
    }
  };

  // Capture frame from video and run OCR
  const captureFrame = async () => {
    if (!videoRef.current) return;
    setScanning(true);
    setErrorMsg('');
    setOcrStatus('Scanning for vehicle number plate...');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Call Gemini OCR endpoint
        setOcrStatus('Analyzing with ANPR OCR...');
        const res = await api.scanPlateOCR(dataUrl);
        if (res.found && res.plateText && res.plateText !== 'NONE') {
          setOcrStatus(`Plate Verified: ${res.plateText} ✓`);
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
          setTimeout(() => {
            onPlateDetected(res.plateText!);
          }, 400);
          return;
        } else {
          setErrorMsg(res.message || 'No vehicle plate detected. Only vehicle license plates are scanned (faces and people are ignored).');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Recognition error. Please ensure the vehicle plate is visible, or enter manually.');
    } finally {
      setScanning(false);
      setOcrStatus('');
    }
  };

  // Handle Photo File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setErrorMsg('');
    setOcrStatus('Scanning photo for license plate...');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.scanPlateOCR(base64);
        if (res.found && res.plateText && res.plateText !== 'NONE') {
          onPlateDetected(res.plateText);
        } else {
          setErrorMsg(res.message || 'No vehicle number plate found in photo. Please ensure a vehicle license plate is clearly visible.');
        }
      } catch (err) {
        setErrorMsg('OCR scan failed on photo. Please enter manually.');
      } finally {
        setScanning(false);
        setOcrStatus('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit manual plate
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualPlateInput.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!clean) return;
    onPlateDetected(clean);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white max-w-md mx-auto">
      {/* Hidden file input and canvas */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div className="z-20 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-white hover:bg-slate-800 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-white tracking-wide">Scan Number Plate</h2>
            <p className="text-[10px] text-indigo-300">Point at blocking vehicle plate</p>
          </div>

          <button
            onClick={toggleFlash}
            className={`p-2.5 rounded-full border transition ${
              torch
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            aria-label="Toggle Flashlight"
          >
            {torch ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Strict ANPR Privacy Strip */}
        <div className="px-3 py-2 bg-indigo-950/95 border-y border-indigo-800/60 text-[11px] text-indigo-200 flex items-center justify-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-medium text-center">
            <strong>STRICT ANPR:</strong> Only vehicle number plates scanned. Faces & people ignored.
          </span>
        </div>
      </div>

      {/* Camera Viewport / Center Guide */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Real Video Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* If camera is not streaming, show helpful fallback message */}
        {!stream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/80">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center mb-3 text-indigo-400">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Point at Vehicle Number Plate</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              Capture or upload a clear photo of the blocking vehicle's number plate. Faces and surroundings are strictly excluded.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Plate Photo
              </button>
              <button
                onClick={() => setManualModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Keyboard className="w-4 h-4" />
                Enter Manually
              </button>
            </div>
          </div>
        )}

        {/* Dark overlay with cut-out viewfinder */}
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

        {/* Viewfinder Bounding Box styled like an Indian HSRP / Universal Number Plate */}
        <div className="relative z-10 w-80 h-32 rounded-xl border-2 border-indigo-400/90 bg-slate-950/40 backdrop-blur-[2px] shadow-2xl flex flex-col items-center justify-center p-2">
          {/* Laser scanning line */}
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38bdf8] animate-scan-beam" />

          {/* 4 Corner Markers */}
          <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
          <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

          {/* Simulated HSRP License Plate Cutout */}
          <div className="w-full h-16 rounded-lg border border-slate-600/80 bg-white/5 backdrop-blur-sm flex items-center px-3 gap-2">
            {/* Blue IND Strip */}
            <div className="w-6 h-10 rounded bg-blue-700 flex flex-col items-center justify-center text-[8px] font-black text-white shrink-0 shadow">
              <span className="text-[7px]">🇮🇳</span>
              <span className="tracking-tighter">IND</span>
            </div>

            {/* License plate alignment target text */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono font-black text-white tracking-widest uppercase">
                KA 01 AB 1234
              </span>
              <span className="text-[9px] text-cyan-300 font-semibold tracking-wider">
                [ ALIGN VEHICLE PLATE HERE ]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-700/60 text-[9px] font-bold text-indigo-300">
              VEHICLE PLATES ONLY • NO FACES
            </span>
          </div>
        </div>

        {/* Scanning or error feedback toast */}
        {(ocrStatus || errorMsg) && (
          <div className="absolute bottom-6 inset-x-4 z-20">
            <div
              className={`p-3.5 rounded-2xl text-xs backdrop-blur-md text-center shadow-xl border flex items-center justify-center gap-2 ${
                errorMsg
                  ? 'bg-rose-950/95 border-rose-500/70 text-rose-200'
                  : 'bg-indigo-950/95 border-indigo-500/70 text-indigo-200 animate-pulse'
              }`}
            >
              {errorMsg && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{ocrStatus || errorMsg}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Area (Matching Screen 5) */}
      <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20 space-y-4">
        {/* Shutter & Gallery Controls */}
        <div className="flex items-center justify-around">
          {/* Gallery Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white transition active:scale-95"
            title="Upload photo of number plate"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          {/* Primary Shutter Button */}
          <button
            onClick={captureFrame}
            disabled={scanning}
            className="w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl shadow-indigo-500/30"
            aria-label="Capture number plate"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-slate-100 flex items-center justify-center transition">
              {scanning ? (
                <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-slate-300 bg-white" />
              )}
            </div>
          </button>

          {/* Manual Entry Toggle */}
          <button
            onClick={() => setManualModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white transition active:scale-95"
            title="Enter plate manually"
          >
            <Keyboard className="w-6 h-6" />
          </button>
        </div>

        {/* Enter Number Plate Manually Primary Button */}
        <div>
          <button
            onClick={() => setManualModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
          >
            <Keyboard className="w-4 h-4 text-indigo-400" />
            Enter Number Plate Manually
          </button>
        </div>
      </div>

      {/* Manual Plate Entry Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-400" />
                Enter Number Plate
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Enter the registration number plate printed on the blocking vehicle (e.g. KA01AB1234).
            </p>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
              <input
                type="text"
                autoFocus
                value={manualPlateInput}
                onChange={e => setManualPlateInput(e.target.value.toUpperCase())}
                placeholder="KA01AB1234"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-indigo-500/40 text-center text-lg font-mono font-black tracking-widest text-white uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualPlateInput.trim()}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Search Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
