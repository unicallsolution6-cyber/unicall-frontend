'use client';

export default function TruePeople() {
  return (
    <div className="flex-1 p-4">
      <div className="w-full h-full rounded-lg overflow-hidden">
        <iframe
          src="https://www.truepeoplesearch.com/"
          className="w-full h-[calc(100vh-200px)] border-0"
          title="People Search"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
