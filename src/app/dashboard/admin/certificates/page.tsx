"use client";

import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import CertificateTemplate from '../../../components/CertificateTemplate';

interface Student {
  id: string;
  name: string;
}

export default function AdminCertificatesPage() {
  const [genForm, setGenForm] = useState({ sessionId: '', studentId: '', title: '' });
  const [showGenModal, setShowGenModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [sessionsList, setSessionsList] = useState<{ id: string; name: string }[]>([]);
  const [style, setStyle] = useState('Elegant');
  const CERT_WIDTH = 420;
  const CERT_HEIGHT = 297;
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [certScale, setCertScale] = useState(1);

  useEffect(() => {
    setStudentsList([
      { id: '1', name: 'Test Student' },
      { id: '2', name: 'Jane Doe' },
    ]);
    setSessionsList([
      { id: '1', name: '2024 Session' },
      { id: '2', name: '2025 Session' },
    ]);
  }, []);

  function handleGeneratePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!genForm.studentId || !genForm.title) {
      return;
    }
    setShowPreview(true);
    setTimeout(() => {
      const box = previewBoxRef.current;
      if (box) {
        const width = box.offsetWidth;
        const height = box.offsetHeight;
        const scale = Math.min(
          (width * 0.95) / CERT_WIDTH,
          (height * 0.95) / CERT_HEIGHT
        );
        setCertScale(scale);
      }
    }, 50);
  }

  return (
    <DashboardLayout role="admin">
      <button
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-medium mb-4"
        onClick={() => setShowGenModal(true)}
      >
        + Generate Certificate
      </button>
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-blue-700 text-white p-6">
              <h1 className="text-2xl font-bold">Generate Certificate</h1>
            </div>
            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Domain Owner</h2>
                  <div className="w-full p-3 border border-gray-300 rounded bg-gray-50 font-semibold text-gray-800">
                    {studentsList.find((s: Student) => s.id === genForm.studentId)?.name || 'Select a student'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">This will appear as the certificate owner</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Certificate Style</h2>
                  <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={style} onChange={e => setStyle(e.target.value)}>
                    <option value="Elegant">Elegant</option>
                    <option value="Modern">Modern</option>
                    <option value="Classic">Classic</option>
                  </select>
                </div>
                <form onSubmit={handleGeneratePreview} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Session</h2>
                    <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.sessionId} onChange={e => setGenForm(f => ({ ...f, sessionId: e.target.value }))} required>
                      <option value="">Select session</option>
                      {sessionsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Student</h2>
                    <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.studentId} onChange={e => setGenForm(f => ({ ...f, studentId: e.target.value }))} required disabled={!genForm.sessionId}>
                      <option value="">Select student</option>
                      {studentsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Certificate Title</h2>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.title} onChange={e => setGenForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="px-6 py-3 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-semibold w-full">Generate Preview</button>
                  </div>
                </form>
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-lg font-semibold mb-2">Certificate Details</h2>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {studentsList.find((s: Student) => s.id === genForm.studentId)?.name || '-'}</p>
                    <p><span className="font-medium">Date Created:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-medium">Type:</span> ScholarProof Certificate</p>
                    <p><span className="font-medium">Status:</span> Active</p>
                  </div>
                </div>
              </div>
              {/* Preview Section */}
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Certificate Preview</h2>
                <div className="flex-1 flex flex-col min-w-0">
                  <div 
                    className="flex-1 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[220px]" 
                    ref={previewBoxRef} 
                    style={{ aspectRatio: '420/297' }}
                  >
                    {showPreview ? (
                      <div
                        style={{
                          width: CERT_WIDTH,
                          height: CERT_HEIGHT,
                          transform: `scale(${certScale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <CertificateTemplate
                          studentName={studentsList.find((s: Student) => s.id === genForm.studentId)?.name || 'Student Name'}
                          title={genForm.title || 'Certificate Title'}
                          description={''}
                          dateIssued={new Date().toLocaleDateString()}
                          revoked={false}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center p-4">
                        Click "Generate Preview" to see your certificate.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Form buttons */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-medium"
                onClick={() => {
                  setShowGenModal(false);
                  setShowPreview(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}