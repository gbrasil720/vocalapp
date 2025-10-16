import Link from 'next/link'
import Hyperspeed from '../Hyperspeed'
import { Button } from '../ui/button'

export function CTA() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => {},
            onSlowDown: () => {},
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0xffffff,
              brokenLines: 0xffffff,
              leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
              rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
              sticks: 0x03b3c3
            }
          }}
        />
      </div>

      {/* Text content on top */}
      <div className="relative w-screen h-[100vh] z-40 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="font-['Satoshi'] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-7xl bg-gradient-to-r from-[#d856bf] via-[#c247ac] to-[#03b3c3] bg-clip-text text-transparent leading-tight drop-shadow-lg max-w-4xl">
            The best speech-to-text experience you'll ever have.
          </h1>
          <p className="font-['Inter'] font-normal text-base sm:text-lg lg:text-2xl mt-4 sm:mt-6 text-[#03b3c3]/90 max-w-3xl leading-relaxed text-center mx-auto">
            Transform any audio into precise text with cutting-edge AI. 100%
            accurate transcription. No more manual transcription.
          </p>
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-transparent text-whtie px-8 py-6 text-lg cursor-pointer hover:bg-[#03b3c3]/20 transition-all"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              className="rounded-full backdrop-blur-xl bg-transparent text-whtie px-8 py-6 text-lg cursor-pointer hover:bg-[#d856bf]/20 transition-all"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
