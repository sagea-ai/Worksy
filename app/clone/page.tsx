"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

// Simple components
const Button = ({ children, variant = "primary", className = "", onClick, disabled = false, ...props }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
      variant === 'secondary' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 
      variant === 'ghost' ? 'bg-transparent hover:bg-gray-100 text-gray-600' :
      'bg-blue-600 hover:bg-blue-700 text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

// Mock app config
const appConfig = {
  ai: {
    defaultModel: "gpt-3.5-turbo" as const,
    availableModels: ["gpt-3.5-turbo", "gpt-4", "claude-3-haiku"] as const,
    modelDisplayNames: {
      "gpt-3.5-turbo": "GPT-3.5 Turbo",
      "gpt-4": "GPT-4",
      "claude-3-haiku": "Claude 3 Haiku"
    } as Record<string, string>
  }
};

interface SearchResult {
  url: string;
  title: string;
  description: string;
  screenshot: string | null;
  markdown: string;
}

export default function HomePage() {
  const [url, setUrl] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("1");
  const [selectedModel, setSelectedModel] = useState<string>(appConfig.ai.defaultModel);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [showSearchTiles, setShowSearchTiles] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showSelectMessage, setShowSelectMessage] = useState<boolean>(false);
  const [showInstructionsForIndex, setShowInstructionsForIndex] = useState<number | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const router = useRouter();
  
  // Simple URL validation
  const validateUrl = (urlString: string) => {
    if (!urlString) return false;
    // Basic URL pattern - accepts domains with or without protocol
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(urlString.toLowerCase());
  };

  // Check if input is a URL (contains a dot)
  const isURL = (str: string): boolean => {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return urlPattern.test(str.trim());
  };

  const styles = [
    { id: "1", name: "Glassmorphism", description: "Frosted glass effect" },
    { id: "2", name: "Neumorphism", description: "Soft 3D shadows" },
    { id: "3", name: "Brutalism", description: "Bold and raw" },
    { id: "4", name: "Minimalist", description: "Clean and simple" },
    { id: "5", name: "Dark Mode", description: "Dark theme design" },
    { id: "6", name: "Gradient Rich", description: "Vibrant gradients" },
    { id: "7", name: "3D Depth", description: "Dimensional layers" },
    { id: "8", name: "Retro Wave", description: "80s inspired" },
  ];

  const models = appConfig.ai.availableModels.map(model => ({
    id: model,
    name: appConfig.ai.modelDisplayNames[model] || model,
  }));

  const handleSubmit = async (selectedResult?: SearchResult) => {
    const inputValue = url.trim();
    
    if (!inputValue) {
      toast.error("Please enter a URL or search term");
      return;
    }
    
    // If it's a search result being selected, fade out and redirect
    if (selectedResult) {
      setIsFadingOut(true);
      
      // Wait for fade animation
      setTimeout(() => {
        sessionStorage.setItem('targetUrl', selectedResult.url);
        sessionStorage.setItem('selectedStyle', selectedStyle);
        sessionStorage.setItem('selectedModel', selectedModel);
        sessionStorage.setItem('autoStart', 'true');
        if (selectedResult.markdown) {
          sessionStorage.setItem('siteMarkdown', selectedResult.markdown);
        }
        router.push('/oploven/generation');
      }, 500);
      return;
    }
    
    // If it's a URL, go straight to generation
    if (isURL(inputValue)) {
      sessionStorage.setItem('targetUrl', inputValue);
      sessionStorage.setItem('selectedStyle', selectedStyle);
      sessionStorage.setItem('selectedModel', selectedModel);
      sessionStorage.setItem('autoStart', 'true');
      router.push('/oploven/generation');
    } else {
      // It's a search term, fade out if results exist, then search
      if (hasSearched && searchResults.length > 0) {
        setIsFadingOut(true);
        
        setTimeout(async () => {
          setSearchResults([]);
          setIsFadingOut(false);
          setShowSelectMessage(true);
          
          // Perform new search
          await performSearch(inputValue);
          setHasSearched(true);
          setShowSearchTiles(true);
          setShowSelectMessage(false);
          
          // Smooth scroll to carousel
          setTimeout(() => {
            const carouselSection = document.querySelector('.carousel-section');
            if (carouselSection) {
              carouselSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }, 500);
      } else {
        // First search, no fade needed
        setShowSelectMessage(true);
        setIsSearching(true);
        setHasSearched(true);
        setShowSearchTiles(true);
        
        // Scroll to carousel area immediately
        setTimeout(() => {
          const carouselSection = document.querySelector('.carousel-section');
          if (carouselSection) {
            carouselSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        await performSearch(inputValue);
        setShowSelectMessage(false);
        setIsSearching(false);
        
        // Smooth scroll to carousel
        setTimeout(() => {
          const carouselSection = document.querySelector('.carousel-section');
          if (carouselSection) {
            carouselSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  };

  // Perform search when user types
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || isURL(searchQuery)) {
      setSearchResults([]);
      setShowSearchTiles(false);
      return;
    }

    setIsSearching(true);
    setShowSearchTiles(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchTiles(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Quick Ship</h1>
              </div>
            </div>
            <Button variant="secondary" className="flex items-center space-x-2">
              <GithubIcon />
              <span>View on GitHub</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            ✨ Transform any website in seconds
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Re-imagine any website,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              in seconds
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Enter any website URL or search for inspiration. Our AI will help you redesign it with modern styles and cutting-edge aesthetics.
          </p>
        </div>

        {/* Main Input Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Search Input */}
            <div className="p-6">
              {hasSearched && searchResults.length > 0 && !isFadingOut ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">Select a website from the results below</p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsFadingOut(true);
                      setTimeout(() => {
                        setSearchResults([]);
                        setHasSearched(false);
                        setShowSearchTiles(false);
                        setIsFadingOut(false);
                        setUrl('');
                      }, 500);
                    }}
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>New Search</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {isURL(url) ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <input
                    className="flex-1 text-lg text-gray-900 placeholder-gray-500 border-none focus:outline-none"
                    placeholder="Enter website URL or search term..."
                    type="text"
                    value={url}
                    disabled={isSearching}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUrl(value);
                      setIsValidUrl(validateUrl(value));
                      if (value.trim() === "") {
                        setShowSearchTiles(false);
                        setHasSearched(false);
                        setSearchResults([]);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSearching) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isSearching || !url.trim()}
                    className="flex items-center space-x-2"
                  >
                    {isSearching ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m100 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10 A40 40 0 0 1 100 50z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                    <span>{isURL(url) ? 'Analyze Site' : 'Search'}</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Style & Model Options */}
            {isValidUrl && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Design Style</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {styles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                            selectedStyle === style.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Make it dark themed, add animations..."
                        onChange={(e) => sessionStorage.setItem('additionalInstructions', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Carousel */}
        {showSearchTiles && hasSearched && (
          <section className={`relative w-full overflow-hidden transition-opacity duration-500 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}>
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m100 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10 A40 40 0 0 1 100 50z"></path>
                  </svg>
                  <span className="text-gray-600">Searching for websites...</span>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.url}-${index}`}
                    className="group bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {result.screenshot ? (
                        <Image 
                          src={result.screenshot} 
                          alt={result.title}
                          className="w-full h-full object-cover"
                          width={400}
                          height={192}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            <p className="text-gray-500 text-sm">{result.title}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Button
                            onClick={() => handleSubmit(result)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Clone This Site
                          </Button>
                          <Button
                            onClick={() => setShowInstructionsForIndex(index)}
                            variant="secondary"
                            className="bg-white text-gray-700"
                          >
                            Add Instructions
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{result.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{result.description}</p>
                      <p className="text-blue-600 text-xs mt-2 truncate">{result.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}