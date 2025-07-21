import React from "react";
import Image from "next/image";

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
  institutionName = "ScholarProof University",
  institutionLogoUrl = "/file.svg", // Default logo
  revoked = false,
}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg border-4 border-gray-200 p-8 max-w-2xl mx-auto font-sans relative print:max-w-full print:shadow-none print:border-0 print:p-4">
      {/* Logo and Institution */}
      <div className="flex items-center justify-center mb-6">
        <Image src={institutionLogoUrl} alt="Institution Logo" width={64} height={64} className="h-16 w-16 mr-4" />
        <span className="text-2xl font-bold tracking-wide uppercase text-gray-800">{institutionName}</span>
      </div>
      {/* Title */}
      <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight">{title}</h2>
      {/* Student Name */}
      <p className="text-xl text-center mb-4">
        <span className="font-semibold">Awarded to:</span> <span className="font-bold underline">{studentName}</span>
      </p>
      {/* Description */}
      {description && (
        <p className="text-center text-gray-700 mb-4 whitespace-pre-line">{description}</p>
      )}
      {/* Date Issued */}
      <div className="flex justify-between items-center mt-8 mb-2">
        <div className="text-gray-600 text-sm">Date Issued:</div>
        <div className="font-medium text-gray-900">{new Date(dateIssued).toLocaleDateString()}</div>
      </div>
      {/* Revoke Badge */}
      {revoked && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-full font-bold text-xs shadow-lg rotate-6">
          REVOKED
        </div>
      )}
      {/* Watermark (optional, faded) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-6xl font-extrabold text-gray-200 opacity-20 tracking-widest">ScholarProof</span>
      </div>
    </div>
  );
};

export default CertificateTemplate; 