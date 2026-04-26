import { HiMenu } from 'react-icons/hi'
import { Link, useLocation } from "react-router";

export default function NavBar() {
  const { pathname } = useLocation();

  const toggleMenu = () => {
    const menu = document.getElementById('mobileMenu')
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden')
    } else {
      menu.classList.add('hidden')
    }
  }

  return (
    <header className="flex justify-between items-center py-4 px-4 lg:px-10">
      <Link className="text-3xl md:text-4xl lg:text-5xl font-light m-0" to="/">Fonn</Link>

      <nav className="hidden md:flex items-center gap-12">
        <Link className={`hover:text-gray-300 z-50 ${pathname === "/" ? "underline" : ""}`} to="/">Home</Link>
        <Link className={`hover:text-gray-300 z-50 ${pathname === "/upload" ? "underline" : ""}`} to="/upload">Upload</Link>
      </nav>

      <button onClick={toggleMenu} className="md:hidden text-3xl p-2 z-50">
        <HiMenu className='hover:cursor-pointer' size={32} />
      </button>

      <div id='mobileMenu' className='hidden fixed top-16 bottom-0 right-0 left-0 p-5 md:hidden z-40 bg-black/70 backdrop-blur-md'>
        <nav className='flex flex-col gap-6 items-center'>
          <Link className={`hover:text-gray-300 ${pathname === "/" ? "underline" : ""}`} to="/">Home</Link>
          <Link className={`hover:text-gray-300 ${pathname === "/upload" ? "underline" : ""}`} to="/upload">Upload</Link>
        </nav>
      </div>
    </header>
  )
}