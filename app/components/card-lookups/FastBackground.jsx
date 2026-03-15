'use client';

export default function FastBackground() {
  return (
    <div className="flex-1 p-4">
      <div className="w-full h-full rounded-lg overflow-hidden">
        <iframe
          src="https://www.fastbackgroundcheck.com/phone"
          className="w-full h-[calc(100vh-200px)] border-0"
          title="Phone Lookup"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
