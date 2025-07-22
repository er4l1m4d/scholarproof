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
      // Use native download for now
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
      <div className="flex gap-2 mt-2">
        <a
          href={isRevoked ? undefined : `/cert/${cert.id}`}
          className={`px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium transition ${isRevoked ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          tabIndex={isRevoked ? -1 : 0}
          aria-disabled={isRevoked}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'View certificate'}
        >
          View
        </a>
        <button
          onClick={handleDownload}
          disabled={isRevoked || downloading}
          className={`px-3 py-1 rounded bg-green-600 text-white text-sm font-medium transition ${isRevoked || downloading ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-green-700'}`}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'Download certificate'}
        >
          {downloading ? 'Downloading...' : 'Download'}
        </button>
        <button
          onClick={handleCopyLink}
          disabled={isRevoked}
          className={`px-3 py-1 rounded bg-gray-600 text-white text-sm font-medium transition ${isRevoked ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-700'}`}
          title={isRevoked ? 'This certificate has been revoked by an admin.' : 'Copy certificate link'}
        >
          {copySuccess ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default CertificateCard; 