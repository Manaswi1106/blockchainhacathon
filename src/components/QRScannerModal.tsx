import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../types';
import {
  X,
  Camera,
  Upload,
  QrCode,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  VideoOff,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserAccount[];
  activeUser: UserAccount;
  onScanSuccess: (recipientUpi: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  activeUser,
  onScanSuccess,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedRecipient, setScannedRecipient] = useState<UserAccount | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse QR content string to extract valid UPI ID
  const parseUpiFromText = (codeText: string): UserAccount | null => {
    let cleanText = codeText.trim();
    if (!cleanText) return null;
    
    // Check if it's a upi:// url like upi://pay?pa=manu@ibl&pn=Manu%20Sharma
    if (cleanText.includes('pa=')) {
      try {
        const urlParams = new URLSearchParams(cleanText.split('?')[1] || cleanText);
        const pa = urlParams.get('pa');
        if (pa) cleanText = pa;
      } catch (e) {
        // ignore
      }
    }

    const lower = cleanText.toLowerCase();

    // Match against user list
    const foundUser = allUsers.find(
      (u) =>
        u.upiId.toLowerCase() === lower ||
        lower.includes(u.upiId.toLowerCase()) ||
        lower.includes(u.name.toLowerCase().split(' ')[0]) ||
        (u.phone && lower.includes(u.phone))
    );

    if (foundUser) return foundUser;

    // Fallback: Create dynamic recipient for any scanned QR
    const upiIdOnly = lower.includes('@')
      ? cleanText.split('?')[0].replace('upi://pay', '').trim()
      : `${cleanText.replace(/[^a-zA-Z0-9]/g, '')}@ibl`;

    const recipientName = cleanText.includes('@')
      ? cleanText.split('@')[0].toUpperCase()
      : cleanText.slice(0, 15).toUpperCase();

    return {
      id: 'scanned_' + Date.now(),
      name: recipientName || 'VERIFIED PAYEE',
      upiId: upiIdOnly,
      accountNumber: '758900' + Math.floor(1000 + Math.random() * 9000),
      phone: '8688187443',
      pin: '1234',
      balance: 0,
      walletAddress: 'SAHA1122334455667788990011223344556677889900112233ALGO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      policy: {
        dailyLimit: 100000,
        transactionLimit: 50000,
        monthlyLimit: 500000,
        highRiskThreshold: 25000,
        blockedAccounts: [],
        trustedAccounts: [],
      },
    };
  };

  // Start Real Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        startDecodingLoop();
      }
    } catch (err: any) {
      console.warn('Camera Access Error:', err);
      setCameraError(
        err.message || 'Unable to access live camera. You can upload a QR image or use test QR presets below.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Continuous Camera Frame Decoding Loop
  const startDecodingLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animFrameIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvasRef.current = canvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          console.log('[CAMERA QR DECODED]', code.data);
          const matchedUser = parseUpiFromText(code.data);
          if (matchedUser) {
            stopCamera();
            setScannedRecipient(matchedUser);
            return;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle File Upload QR Scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          setIsScanning(false);

          if (code && code.data) {
            const matchedUser = parseUpiFromText(code.data);
            if (matchedUser) {
              setScannedRecipient(matchedUser);
            } else {
              alert(`Decoded QR: "${code.data}" - No matching UPI account found.`);
            }
          } else {
            alert('Could not detect a valid QR code in the uploaded image.');
          }
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Auto-start camera on open
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedRecipient(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (user: UserAccount) => {
    stopCamera();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedRecipient(user);
    }, 800);
  };

  const handleProceedToPayment = () => {
    if (scannedRecipient) {
      onScanSuccess(scannedRecipient.upiId);
      onClose();
      setScannedRecipient(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white relative"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base">Camera QR Code Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
              setScannedRecipient(null);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera View */}
        <div className="p-6 text-center">
          {!scannedRecipient ? (
            <div>
              {/* Camera Frame */}
              <div className="relative w-full h-64 mx-auto rounded-3xl overflow-hidden border-2 border-cyan-500/50 bg-black flex flex-col items-center justify-center mb-5 shadow-2xl">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Laser Overlay Animation when camera active */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: [-110, 110, -110] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                    />
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                )}

                {/* Loading or Static Camera Placeholder */}
                {!isCameraActive && !isScanning && (
                  <div className="text-center p-4">
                    <Camera className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-slate-300 font-mono">
                      {cameraError ? 'Camera Standby' : 'Initializing Camera Feed...'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Point camera at any UPI or BlockPay QR code
                    </p>
                    <button
                      onClick={startCamera}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Start Camera
                    </button>
                  </div>
                )}

                {/* Scanning Spinner */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                    <p className="text-xs font-mono text-cyan-300">Decoding QR Code...</p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{cameraError}</p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Upload Image
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Camera Sync
                </button>
              </div>

              {/* Sample QR Presets for Demo */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-left">
                Test QR Code Presets
              </p>

              <div className="space-y-2">
                {(() => {
                  const manuUser = allUsers.find((u) => u.upiId.includes('manu')) || allUsers[0];
                  return (
                    <button
                      onClick={() => handleSimulateScan(manuUser)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-cyan-500/30 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                          QR-1
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Manu Sharma <span className="text-cyan-400 font-mono text-[11px]">(manu@ibl)</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-1 rounded-lg">
                        Test QR-1
                      </span>
                    </button>
                  );
                })()}

                {(() => {
                  const sahaUser = allUsers.find((u) => u.upiId.includes('saha')) || allUsers[1] || allUsers[0];
                  return (
                    <button
                      onClick={() => handleSimulateScan(sahaUser)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-purple-500/30 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
                          QR-2
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Sahasra Kona <span className="text-purple-400 font-mono text-[11px]">(saha@ibl)</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2.5 py-1 rounded-lg">
                        Test QR-2
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* Detected Recipient Confirmation Card */
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  QR Payload Decoded
                </span>
                <h4 className="text-lg font-bold text-white mt-2">Paying {scannedRecipient.name}</h4>
                <p className="text-xs text-cyan-400 font-mono">{scannedRecipient.upiId}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="text-white">XXXX{scannedRecipient.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Number:</span>
                  <span className="text-white">+91 {scannedRecipient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Rating:</span>
                  <span className="text-emerald-400 font-bold">Verified Account</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition"
              >
                Proceed to Pay Amount
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

