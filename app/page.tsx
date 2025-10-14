import LaserFlow from "@/components/LaserFlow";
import { Navbar } from "@/components/navbar";
import { Highlighter } from "@/components/ui/highlighter";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-40 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-['Satoshi'] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#7982ff] via-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent leading-tight drop-shadow-lg">
          The best speech-to-text experience you'll ever have
        </h1>
        <p className="font-['Inter'] font-normal text-base sm:text-lg lg:text-xl mt-4 sm:mt-6 text-white/90 max-w-3xl mx-auto leading-relaxed">
          Transform your voice into precise text with cutting-edge AI. Lightning-fast transcription with industry-leading accuracy.
        </p>
      </div>
          <div className="hidden sm:block">
            <LaserFlow color="#7982ff" horizontalBeamOffset={0.1} verticalBeamOffset={-0.1} verticalSizing={2} className="z-10"/>
          </div>
        
            <div className="w-full h-[600px] sm:h-[700px] lg:h-[700px] relative overflow-hidden mt-80 sm:mt-80 md:mt-80 lg:-mt-102">
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[86%] h-[50%] sm:h-[60%] bg-[#060010] rounded-2xl border-2 border-[#7982ff] flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl z-50">
          <p>Hello</p>
        </div>
      </div>
    </>
  );
}
