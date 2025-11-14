import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import Editor from "@monaco-editor/react";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
import { GoogleGenAI } from "@google/genai";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

const Home = () => {
  const options = [
    { value: "html-css", label: "HTML + CSS" },
    { value: "html-tailwind", label: "HTML + Tailwind CSS" },
    { value: "html-bootstrap", label: "HTML + Bootstrap" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "html-tailwind-bootstrap", label: "HTML + Tailwind + Bootstrap" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extract code safely from markdown
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  // Utility: get correct text from Gemini response
  function getTextFromResponse(res) {
    try {
      return (
        res?.candidates?.[0]?.content?.parts?.[0]?.text ||
        res?.text ||
        JSON.stringify(res)
      );
    } catch {
      return "";
    }
  }

  // Initialize GoogleGenAI client
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyB1SJLA3uqNM28RYDJ_DpsjuU9TdG9Y1qU",
  });

  // ✅ Generate code with retry + fallback
  async function getResponse() {
    if (!prompt.trim())
      return toast.error("Please describe your component first");
    if (!frameWork) return toast.error("Please select a framework");

    setLoading(true);

    const payload = {
      model: "gemini-2.5-flash",
      contents: `
You are an experienced programmer with expertise in web development and UI/UX design.
Generate a UI component for: ${prompt}
Framework: ${frameWork.value}
Requirements:
- Clean, structured, easy-to-understand code
- Modern, animated, responsive UI design
- Only return code in a Markdown code block
- Entire component in a single HTML file
      `,
    };

    try {
      // Retry loop
      let response;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await ai.models.generateContent(payload);
          break; // Success
        } catch (err) {
          if (err.error?.code === 503) {
            console.warn("503 — retry attempt:", attempt);
            await new Promise((res) => setTimeout(res, attempt * 1500));
            continue;
          }
          throw err;
        }
      }

      if (!response) throw new Error("Gemini failed after retries");

      const text = getTextFromResponse(response);
      setCode(extractCode(text));
      setOutputScreen(true);
    } catch (err) {
      console.error(err);
      // Fallback to 1.5 model if overloaded
      if (err.error?.code === 503) {
        try {
          const fallback = await ai.models.generateContent({
            ...payload,
            model: "gemini-1.5-flash",
          });
          const text = getTextFromResponse(fallback);
          setCode(extractCode(text));
          setOutputScreen(true);
          toast.info("Fallback model used (1.5-flash)");
        } catch (e) {
          toast.error("AI servers overloaded — try again later");
        }
      } else {
        toast.error("Something went wrong while generating code");
      }
    } finally {
      setLoading(false);
    }
  }

  // ✅ Copy code
  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  // ✅ Download code
  const downnloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");
    const fileName = "GenUI-Code.html";
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    toast.success("File downloaded");
  };

  return (
    <>
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-16">
        {/* Left Section */}
        <div className="w-full py-6 rounded-xl bg-[#141319] mt-5 p-5">
          <h3 className="text-[25px] font-semibold sp-text">
            AI Component Generator
          </h3>
          <p className="text-gray-400 mt-2 text-[16px]">
            Describe your component and let AI code it for you.
          </p>

          <p className="text-[15px] font-[700] mt-4">Framework</p>
          <Select
            className="mt-2"
            options={options}
            value={frameWork}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#111",
                borderColor: "#333",
                color: "#fff",
                boxShadow: "none",
                "&:hover": { borderColor: "#555" },
              }),
              menu: (base) => ({ ...base, backgroundColor: "#111", color: "#fff" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#333" : state.isFocused ? "#222" : "#111",
                color: "#fff",
                "&:active": { backgroundColor: "#444" },
              }),
              singleValue: (base) => ({ ...base, color: "#fff" }),
              placeholder: (base) => ({ ...base, color: "#aaa" }),
              input: (base) => ({ ...base, color: "#fff" }),
            }}
            onChange={(e) => setFrameWork(e)}
          />

          <p className="text-[15px] font-[700] mt-5">Describe your component</p>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className="w-full min-h-[200px] rounded-xl bg-[#09090B] mt-3 p-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Describe your component in detail and AI will generate it..."
          ></textarea>

          <div className="flex items-center justify-between mt-3">
            <p className="text-gray-400 text-sm">
              Click on generate button to get your code
            </p>
            <button
              onClick={getResponse}
              className="flex items-center p-3 rounded-lg border-0 bg-gradient-to-r from-purple-400 to-purple-600 px-5 gap-2 transition-all hover:opacity-80 hover:scale-105 active:scale-95"
            >
              {loading ? <ClipLoader color="white" size={18} /> : <BsStars />}
              Generate
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative mt-2 w-full h-[80vh] bg-[#141319] rounded-xl overflow-hidden">
          {!outputScreen ? (
            <div className="w-full h-full flex items-center flex-col justify-center">
              <div className="p-5 w-[70px] flex items-center justify-center text-[30px] h-[70px] rounded-full bg-gradient-to-r from-purple-400 to-purple-600">
                <HiOutlineCode />
              </div>
              <p className="text-[16px] text-gray-400 mt-3">
                Your component & code will appear here.
              </p>
              {loading ? <ClipLoader color="white" size={18} /> : <BsStars />}
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="bg-[#17171C] w-full h-[50px] flex items-center gap-3 px-3">
                <button
                  onClick={() => setTab(1)}
                  className={`w-1/2 py-2 rounded-lg transition-all ${
                    tab === 1 ? "bg-purple-600 text-white" : "bg-zinc-800 text-gray-300"
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`w-1/2 py-2 rounded-lg transition-all ${
                    tab === 2 ? "bg-purple-600 text-white" : "bg-zinc-800 text-gray-300"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-[#17171C] w-full h-[50px] flex items-center justify-between px-4">
                <p className="font-bold text-gray-200">Code Editor</p>
                <div className="flex items-center gap-2">
                  {tab === 1 ? (
                    <>
                      <button
                        onClick={copyCode}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <IoCopy />
                      </button>
                      <button
                        onClick={downnloadFile}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <PiExportBold />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsNewTabOpen(true)}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <ImNewTab />
                      </button>
                      <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <FiRefreshCcw />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="h-full">
                {tab === 1 ? (
                  <Editor value={code} height="100%" theme="vs-dark" language="html" />
                ) : (
                  <iframe
                    key={refreshKey}
                    srcDoc={code}
                    className="w-full h-full bg-white text-black"
                  ></iframe>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Overlay */}
      {isNewTabOpen && (
        <div className="absolute inset-0 bg-white w-screen h-screen overflow-auto">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className="font-bold">Preview</p>
            <button
              onClick={() => setIsNewTabOpen(false)}
              className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200"
            >
              <IoCloseSharp />
            </button>
          </div>
          <iframe srcDoc={code} className="w-full h-[calc(100vh-60px)]"></iframe>
        </div>
      )}
    </>
  );
};

export default Home;
