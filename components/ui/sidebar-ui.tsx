// Archivo: components/ui/sidebar-ui.tsx
// Modificado para usar Next/Link y evitar recargas completas

import { ChevronDown, ChevronFirst, ChevronLast, MoreVertical, Menu, X } from "lucide-react";
import almacen from "@/public/assets/almacen.jpg";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SidebarContextType {
  expanded: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  submenu?: { title: string; link: string }[];
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function SidebarUi({ children, className }: SidebarProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
      setExpanded(false);
    } else {
      setExpanded((prev) => !prev);
      setMobileOpen(false);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Manejo de clicks fuera del sidebar en mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const hamburgerButton = document.getElementById('hamburger-button');
      
      if (isMobile && mobileOpen && sidebar && hamburgerButton && 
          !sidebar.contains(event.target as Node) && 
          !hamburgerButton.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileOpen]);

  return (
    <div className="relative">
      {/* Hamburger button */}
      <button
        id="hamburger-button"
        onClick={toggleSidebar}
        className={`
          fixed top-3 left-4  
          z-[999] 
          p-2 
          rounded-lg 
          hover:bg-gray-100 
          transition-colors 
          duration-200 
          dark:bg-gray-800 
          dark:hover:bg-gray-700
          md:hidden
        `}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0z-[90] "
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`
          bg-white dark:bg-black border-r shadow-sm transition-all duration-300 
          ${isMobile ? "fixed h-screen z-[997] w-64" : expanded ? "w-64" : "w-16"}
          ${isMobile && !mobileOpen ? "transform -translate-x-full" : "transform translate-x-0"}
        `}
      >
        <nav className="h-full flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <Image
              src={almacen as StaticImageData}
              className={`overflow-hidden transition-all duration-300 ${
                expanded || mobileOpen ? "w-32" : "w-0"
              }`}
              alt="Logo"
            />
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                {expanded ? <ChevronFirst /> : <ChevronLast />}
              </button>
            )}
          </div>

          <SidebarContext.Provider value={{
            expanded: expanded || mobileOpen,
            isMobile,
            mobileOpen,
            toggleSidebar,
            closeSidebar,
          }}>
            <ul className="flex-1 px-3">{children}</ul>
          </SidebarContext.Provider>

          <div className="border-t flex p-3">
            <Image
              src={almacen as StaticImageData}
              className="w-10 h-10 rounded-md"
              alt="Profile"
            />
            <div
              className={`flex justify-between items-center overflow-hidden transition-all duration-300 ${
                expanded || mobileOpen ? "w-44 ml-3" : "w-0"
              }`}
            >
              <div className="leading-4">
                <h4 className="font-semibold">constGenius</h4>
                <span className="text-xs text-gray-600">constgenius@gmail.com</span>
              </div>
              <MoreVertical size={20} />
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}

export function SidebarItem({ icon, text, active = false, alert = false, submenu }: SidebarItemProps) {
  const router = useRouter();
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("SidebarItem must be used within a Sidebar");
  }
  const { expanded, isMobile, mobileOpen, closeSidebar } = context;
  const [open, setOpen] = useState(false);

  const handleItemClick = (e: React.MouseEvent) => {
    if (submenu) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    } else if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="w-full">
      {submenu ? (
        // Si tiene submenú, usamos un div normal
        <li
          className={`
            relative flex items-center py-2 px-3 my-1 
            font-medium rounded-md cursor-pointer 
            transition-colors group
            ${active 
              ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-white" 
              : "hover:bg-gray-900 hover:text-white text-gray-600 dark:text-white"}
          `}
          onClick={handleItemClick}
        >
          {icon}
          <span
            className={`
              overflow-hidden transition-all duration-300
              ${expanded || mobileOpen ? "w-52 ml-3" : "w-0"}
            `}
          >
            {text}
          </span>
          <ChevronDown
            className={`
              ml-auto transition-transform duration-300
              ${open ? "rotate-180" : ""}
            `}
            size={16}
          />
          {alert && (
            <div
              className={`
                absolute right-2 w-2 h-2 rounded bg-black
                ${expanded || mobileOpen ? "" : "top-2"}
              `}
            />
          )}
        </li>
      ) : (
        // Si no tiene submenú, usamos Link para navegación sin recargas
        <Link href="#" onClick={handleItemClick}>
          <li
            className={`
              relative flex items-center py-2 px-3 my-1 
              font-medium rounded-md cursor-pointer 
              transition-colors group
              ${active 
                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-white" 
                : "hover:bg-gray-900 text-gray-600 dark:text-white"}
            `}
          >
            {icon}
            <span
              className={`
                overflow-hidden transition-all duration-300
                ${expanded || mobileOpen ? "w-52 ml-3" : "w-0"}
              `}
            >
              {text}
            </span>
            {alert && (
              <div
                className={`
                  absolute right-2 w-2 h-2 rounded bg-indigo-400
                  ${expanded || mobileOpen ? "" : "top-2"}
                `}
              />
            )}
          </li>
        </Link>
      )}
      
      {/* Submenú */}
      {submenu && (
        <ul
          className={`
            pl-8 transition-all duration-300
            ${open && (expanded || mobileOpen) ? "block" : "hidden"}
          `}
        >
          {submenu.map((subItem, index) => (
            <Link 
              href={subItem.link} 
              key={index}
              onClick={() => isMobile && closeSidebar()}
            >
              <li
                className="py-1 px-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800 rounded-md cursor-pointer"
              >
                {subItem.title}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}