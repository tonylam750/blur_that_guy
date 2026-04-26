

import Navbar from "../components/navbar"
import Hero from "../components/hero"

export default function Home(){
  return (
  <main className="h-screen flex flex-col"> 
    <img className="absolute top-0 right-0 opacity-60 -z-10" src="/gradient.png" alt="Gradient-img" />
     <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1600' height='1000' viewBox='0 0 1600 1000' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-120 160C120 40 260 40 380 180C500 320 650 320 790 180C930 40 1080 40 1220 190C1360 340 1500 340 1720 180' stroke='white' stroke-opacity='0.1' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M-100 340C120 250 260 260 390 370C520 480 660 490 810 380C960 270 1100 280 1230 390C1360 500 1500 510 1720 390' stroke='white' stroke-opacity='0.06' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M-120 560C120 430 260 430 400 590C540 750 700 750 840 590C980 430 1120 430 1260 600C1400 770 1540 770 1740 590' stroke='white' stroke-opacity='0.1' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M-100 820C140 670 280 670 420 830C560 990 710 990 860 820C1010 650 1160 650 1300 830C1440 1010 1570 1010 1750 830' stroke='white' stroke-opacity='0.06' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M300 -60C220 80 220 230 330 350C440 470 450 620 320 790C190 960 190 1120 320 1280' stroke='white' stroke-opacity='0.05' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M760 -40C690 100 690 250 800 380C910 510 920 660 790 830C660 1000 660 1140 790 1300' stroke='white' stroke-opacity='0.05' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M1360 -60C1280 100 1280 250 1390 380C1500 510 1510 650 1380 820C1250 990 1250 1140 1380 1300' stroke='white' stroke-opacity='0.05' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
         
        }}
      />

    <div className="h-0 w-140 absolute top-[20%] right-[-5%] shadow-[0_0_900px_20px_#e99b63] -rotate-65 -z-10 "></div>
    <Navbar />    
    <Hero/>
   </main>
  )
}