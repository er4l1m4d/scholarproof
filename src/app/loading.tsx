// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <span className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
    </div>
  );
} 