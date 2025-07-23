import React from "react";

interface CertificateTemplateProps {
  studentName: string;
  title: string;
  description?: string;
  dateIssued: string;
  institutionName?: string;
  institutionLogoUrl?: string;
  revoked?: boolean;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  title,
  description,
  dateIssued,
  institutionName,
  institutionLogoUrl,
  revoked = false,
}) => {
  return (
    <div
      className="relative bg-white mx-auto font-sans print:max-w-full print:shadow-none print:border-0 print:p-4 flex flex-col justify-between"
      style={{ width: '1123px', height: '794px', padding: '48px' }} // A4 landscape at 96dpi
    >
      {/* Double Border with Corner Accents */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-lg" />
        <div className="absolute inset-4 border-2 border-blue-400 rounded-lg" />
        {/* Corner accents */}
        <div className="absolute left-0 top-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
        <div className="absolute right-0 top-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
        <div className="absolute left-0 bottom-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
        <div className="absolute right-0 bottom-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold tracking-widest text-blue-800 mb-2 uppercase">Certificate</h1>
        <div className="text-xl tracking-widest text-gray-700 mb-6 uppercase">of Completion</div>
        {/* Subtitle */}
        <div className="text-base tracking-wide text-gray-700 mb-6 uppercase">This certificate is proudly presented to</div>
        {/* Recipient Name (Script font) */}
        <div
          className="mb-4 text-5xl font-bold text-center"
          style={{ fontFamily: 'cursive, "Dancing Script", "Great Vibes", serif' }}
        >
          {studentName}
        </div>
        {/* Description */}
        <div className="text-center text-gray-700 mb-8 max-w-2xl mx-auto">
          {description ||
            'For outstanding completion and achievement. We recognize your dedication and hard work.'}
        </div>
        {/* Title (e.g., course or award) */}
        <div className="text-lg text-center font-semibold mb-8">{title}</div>
        {/* Date, Seal, Signature */}
        <div className="flex items-end justify-between w-full mt-12 px-16">
          <div className="flex flex-col items-center">
            <div className="border-t-2 border-gray-400 w-40 mb-1" />
            <div className="text-xs text-gray-600">Date</div>
            <div className="text-sm text-gray-800">{new Date(dateIssued).toLocaleDateString()}</div>
          </div>
          {/* Circular Seal */}
          <div className="flex flex-col items-center">
            <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#2563eb" strokeWidth="4" fill="#e0e7ff" />
              <circle cx="32" cy="32" r="18" stroke="#2563eb" strokeWidth="2" fill="#fff" />
              <text x="32" y="37" textAnchor="middle" fontSize="16" fill="#2563eb" fontWeight="bold">Seal</text>
            </svg>
            <div className="text-xs text-gray-600 mt-1">Official Seal</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="border-t-2 border-gray-400 w-40 mb-1" />
            <div className="text-xs text-gray-600">Signature</div>
          </div>
        </div>
        {/* Revoke Badge */}
        {revoked && (
          <div className="absolute top-8 right-8 bg-red-600 text-white px-4 py-1 rounded-full font-bold text-xs shadow-lg rotate-6">
            REVOKED
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateTemplate; 