import React from "react";

const NoPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1d] via-[#121214] to-[#000000] text-white text-center p-6">
      <h1 className="text-[8rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse drop-shadow-lg">
        404
      </h1>
      <p className="text-2xl md:text-3xl font-semibold mb-4">
        Oops! Page Not Found 🚧
      </p>
      <p className="text-gray-400 max-w-md mb-6">
        The page you’re looking for doesn’t exist or has been moved. Let’s get
        you back on track.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
      >
        🔙 Go Home
      </button>

      {/* Floating animation circles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-purple-600 opacity-20 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-pink-600 opacity-20 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};

export default NoPage;
