import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { HiSun, HiMoon } from "react-icons/hi";
import { RiSettings3Fill } from "react-icons/ri";

const Navbar = () => {
  const [mode, setMode] = useState("dark");

  const togglemode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    document.body.classList.toggle("light-mode", newMode === "light");
    console.log("Mode changed to:", newMode);
  };

  // Optional: remember last theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setMode("light");
      document.body.classList.add("light-mode");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  return (
    <>
      <div className="nav flex items-center text-2xl font-bold justify-between px-5 h-[90px] border-b border-gray-800">
        <div className="logo text-[#1f2937]">
          <h3 className="text-[25px] text-purple-500 font-700 sp-text">
            GenUI
          </h3>
        </div>
        <div className="icons flex items-center gap-[15px]">
          {/* Toggle Theme Button */}
          <div className="icon" onClick={togglemode}>
            {mode === "dark" ? <HiSun /> : <HiMoon />}
          </div>

          {/* Other Icons */}
          <div className="icon">
            <FaUser />
          </div>
          <div className="icon">
            <RiSettings3Fill />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
