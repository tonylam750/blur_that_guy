import Spline from "@splinetool/react-spline";
import { Link } from "react-router";
import RobotPage from "./robot";
const Hero = () => {

 
  return (
<main className="relative flex flex-1  -mt-10 flex-col items-start justify-center overflow-hidden lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-xl ml-[5%] z-10">

        <h1 className="my-8 text-3xl font-semibold tracking-wider sm:text-4xl md:text-5xl lg:text-6xl">
          Blur
          <br />
          That Guy
        </h1>

        <p className="max-w-[25rem] text-base tracking-wider text-gray-400 sm:text-lg lg:max-w-[40rem]">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi
          asperiores aperiam quam eos, repudiandae inventore ipsum, quidem
          aspernatur voluptate veritatis fuga veniam fugit
        </p>

        <div className="mt-12 flex gap-4">
          <Link
            className="rounded-full border border-[#2a2a2a] px-4 py-2 text-sm font-semibold tracking-wider transition-all duration-300 hover:bg-[#1a1a1a] sm:px-5 sm:py-3 sm:text-lg"
            href=""
          >
            Lorem impsum
          </Link>
          <Link
            className="rounded-full border border-[#2a2a2a] bg-gray-300 px-8 py-2 text-sm font-semibold tracking-wider text-black transition-all duration-300 hover:bg-[#1a1a1a] hover:text-white sm:px-10 sm:py-3 sm:text-lg"
            to={"/upload"}
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* <Spline
        scene="https://prod.spline.design/6BbrCFOI-xuxhfQM/scene.splinecode"
        style={{ width: "60%", height: "700px" }}
      /> */}

      <RobotPage/>


    </main>
  );
};

export default Hero;