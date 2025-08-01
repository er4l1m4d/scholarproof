import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <img src="/ScholarProof Logo.png" alt="ScholarProof Logo" className="mx-auto mb-4 h-16 w-16" />
        <h1 className="text-3xl font-black mb-4 text-[#174AE6]">Welcome to ScholarProof</h1>
        <p className="mb-8 text-gray-600 font-medium">Secure, verifiable academic documents for students and staff.</p>
        <div className="flex flex-col gap-4">
          <Link href="/signup" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition font-medium">Sign Up</Link>
          <Link href="/login" className="w-full bg-gray-200 text-blue-800 py-2 rounded hover:bg-gray-300 transition font-medium">Login</Link>
        </div>
      </div>
    </main>
  );
}
