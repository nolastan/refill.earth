import React, { useState } from 'react';
import { X } from 'lucide-react';

const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      {/* Floating Action Button */}
      <button
        onClick={toggleExpanded}
        className={`
          fixed top-2 right-2 z-50
          w-6 h-6 rounded-full shadow-lg
          bg-green-900 text-white text-lg
          transition-all duration-300 ease-in-out
          hover:bg-teal-500
          flex items-center justify-center
          ${isExpanded ? 'opacity-0' : 'opacity-100'}
        `}
      >
        ?
      </button>

      {/* Expanding Overlay */}
      <div
        className={`
          fixed inset-0 bg-green-900 text-white
          transition-all duration-500 ease-in-out
          flex flex-col items-center
          ${isExpanded ? 'opacity-100 z-50' : 'opacity-0 -z-10'}
          overflow-y-auto
        `}
      >
        <div className="max-w-2xl mx-auto px-6 py-16 relative">
          {/* Close Button */}
          <button
            onClick={toggleExpanded}
            className="absolute top-4 right-4 text-white hover:text-green-200 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">
                Welcome!
              </h1>

              <p className="text-lg leading-relaxed">
                thepark.today is a live map of what's happening in San Francisco's public spaces. These parks are where we come together, 
                where we find joy, and where we build resilience. By making these spaces more visible and accessible, we can strengthen our 
                connections and celebrate the vibrant activities happening throughout our city.
              </p>

              <div className="pt-4">
                <a
                  href="https://nolastan.notion.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-white text-green-900 rounded hover:bg-green-100 transition-colors"
                >
                  Join the mailing list
                </a>
              </div>

              <p class="text-sm text-green-100">
                From the creator of <a 
                href="https://www.talktomel.com" 
                className="underline hover:text-green-200 transition-colors">Mel</a>—the
                missing unsusbscribe button for postal mail.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionButton;