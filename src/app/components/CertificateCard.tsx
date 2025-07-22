import React, { useState } from 'react';

interface CertificateCardProps {
  cert: {
    id: string;
    title?: string;
    created_at?: string;
    irys_url?: string;
    revoked?: boolean;
    sessions?: { name?: string };
  };
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyLink = async () => {
    if (cert.irys_url) {
      await navigator.clipboard.writeText(cert.irys_url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const handleDownload = async () => {
    if (!cert.irys_url) return;
    setDownloading(true);
    try {
      const res = await fetch(cert.irys_url);
      if (!res.ok) throw new Error('Failed to fetch certificate');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download certificate.');
    } finally {
      setDownloading(false);
    }
  };

  const isRevoked = cert.revoked;

  return (
    <div className={`relative border rounded p-4 shadow-sm bg-white flex flex-col gap-2 ${isRevoked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">{cert.title || 'Certificate'}</span>
        {isRevoked && (
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-bold" title="This certificate has been revoked by an admin.">
            Revoked
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500">Session: {cert.sessions?.name || 'N/A'}</div>
      <div className="text-xs text-gray-400">Issued: {cert.created_at?.slice(0, 10) || 'N/A'}</div>
      <div className="flex gap-2 mt-2 flex-wrap">
        <a
          href={isRevoked ? undefined : `/cert/${cert.id}`}
          className={`px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium transition flex items-center gap-1 ${isRevoked ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          tabIndex={isRevoked ? -1 : 0}
          aria-disabled={isRevoked}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'View certificate'}
        >
          <span>View</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m8-4h6" /></svg>
        </a>
        <button
          onClick={handleDownload}
          disabled={isRevoked || downloading}
          className={`px-3 py-1 rounded bg-green-600 text-white text-sm font-medium transition flex items-center gap-1 ${isRevoked || downloading ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-green-700'}`}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'Download certificate'}
        >
          {downloading ? 'Downloading...' : 'Download'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
        </button>
        <button
          onClick={handleCopyLink}
          disabled={isRevoked}
          className={`px-3 py-1 rounded bg-gray-600 text-white text-sm font-medium transition flex items-center gap-1 ${isRevoked ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-700'}`}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'Copy Irys link'}
        >
          <span>{copySuccess ? 'Copied!' : 'Copy Irys Link'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3" /></svg>
        </button>
        <a
          href={cert.irys_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded bg-purple-600 text-white text-sm font-medium transition flex items-center gap-1 hover:bg-purple-700"
          title="View on Irys (decentralized, permanent)"
        >
          <span>View on Irys</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7m0 0L10 21l-7-7 11-11z" /></svg>
        </a>
      </div>
      {/* Toast for copy success */}
      {copySuccess && (
        <div className="absolute top-2 right-2 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-10 animate-fade-in">
          Irys link copied!
        </div>
      )}
    </div>
  );
};

export default CertificateCard; 