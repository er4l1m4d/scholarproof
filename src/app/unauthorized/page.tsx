export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <img src="/ScholarProof Logo.png" alt="ScholarProof Logo" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-black text-[#174AE6] mb-2">Unauthorized</h1>
        <p className="text-gray-600 font-medium">You do not have permission to access this page.</p>
      </div>
    </main>
  );
} 