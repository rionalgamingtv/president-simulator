import React, { useState } from 'react';
import {
  Download,
  Monitor,
  Share,
  X,
  CheckCircle2,
  FolderArchive,
  AlertCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallControlProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallControl: React.FC<PWAInstallControlProps> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [autoStartOnLogin, setAutoStartOnLogin] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (isInstalled) {
    return null;
  }

  const handleDownloadInstaller = async () => {
    setDownloadError(null);
    setIsDownloading(true);
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const url = `/api/download/windows-installer?origin=${encodeURIComponent(
        origin
      )}&autostart=${autoStartOnLogin ? '1' : '0'}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to build Windows 11 installer package.');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'ExecutiveTerm-Windows11-Setup.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setDownloaded(true);
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? err.message
          : 'Unable to download Windows 11 installer.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBrowserInstall = async () => {
    const ok = await install();
    if (ok) {
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDownloaded(false);
          setDownloadError(null);
          setShowModal(true);
        }}
        className={
          variant === 'header'
            ? 'inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238]'
            : 'inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238]'
        }
      >
        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {variant === 'header'
            ? 'Windows 11 Installer'
            : 'Download Windows 11 Installer'}
        </span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Windows 11 Desktop Package &amp; PWA
                </p>
                <h3
                  id="install-guide-title"
                  className="mt-1 font-display text-xl font-semibold text-stone-900"
                >
                  {isIOS
                    ? 'Install on iPhone or iPad'
                    : 'Download & Install Executive Term'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close installation dialog"
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700">
                <li className="flex items-start gap-2.5">
                  <Share className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]" />
                  <span>
                    Tap the <strong>Share</strong> button in your Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]" />
                  <span>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="mt-5 space-y-4 text-sm text-stone-700">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FolderArchive
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#132238]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-stone-900">
                        Windows 11 Setup Package (.zip)
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                        Installs Start Menu &amp; Desktop shortcuts with a
                        custom icon, launches automatically in its own
                        standalone window upon installation, and registers under
                        Windows 11 Settings → Apps.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoStartOnLogin}
                      onChange={(e) => setAutoStartOnLogin(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-[#132238] focus:ring-[#132238]"
                    />
                    <span>
                      Also launch automatically when signing in to Windows
                    </span>
                  </label>

                  {downloadError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-900"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{downloadError}</span>
                    </div>
                  )}

                  {downloaded && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                      <span>
                        Downloaded ExecutiveTerm-Windows11-Setup.zip — extract
                        and run Install Executive Term.cmd to install and start.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadInstaller}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-60 whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {isDownloading
                          ? 'Building Installer...'
                          : 'Download Windows 11 Installer (.zip)'}
                      </span>
                    </button>

                    {isInstallable && (
                      <button
                        type="button"
                        onClick={handleBrowserInstall}
                        className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
                      >
                        <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Direct Browser Install</span>
                      </button>
                    )}
                  </div>
                </div>

                <ol className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-700">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-semibold text-[#132238]">
                      01
                    </span>
                    <span>
                      Right-click{' '}
                      <strong>ExecutiveTerm-Windows11-Setup.zip</strong> in your
                      Downloads folder and choose <strong>Extract All</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-semibold text-[#132238]">
                      02
                    </span>
                    <span>
                      Double-click <strong>Install Executive Term.cmd</strong>{' '}
                      inside the extracted folder (click{' '}
                      <em>More info → Run anyway</em> if Windows SmartScreen
                      prompts for the local script).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-semibold text-[#132238]">
                      03
                    </span>
                    <span>
                      Executive Term installs its Start Menu &amp; Desktop
                      shortcuts and{' '}
                      <strong>launches automatically in a standalone window</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Monitor className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Windows 11 Start Menu, Desktop &amp; Apps integration</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
