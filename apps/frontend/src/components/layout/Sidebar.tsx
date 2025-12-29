import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logoIcon from "../../assests/sidebar/logo.png";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  FolderIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Employees", href: "/employees", icon: UserGroupIcon },
  { name: "Leaves", href: "/leaves", icon: CalendarDaysIcon },
  { name: "Timesheets", href: "/timesheets", icon: ClockIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Reports", href: "/reports", icon: DocumentChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ================= DESKTOP & TABLET (UNCHANGED) ================= */}
      <aside className="
        hidden sm:flex
        w-24
        h-screen
        bg-primary
        flex-col
        items-center
        py-2
        text-white
        rounded-r-2xl
      ">
        {/* Logo */}
        <div className="py-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src={logoIcon} alt="logo" className="w-8" />
          </div>
        </div>

        <div className="h-[0.5px] w-full bg-white my-2" />

        {/* Menu */}
        <nav className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `
                  relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}

                    <Icon className="w-5 h-5" />
                    <span className="text-xs text-center">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* ================= MOBILE TOP BAR ================= */}
      <header className="
        sm:hidden
        fixed top-0 left-0 right-0
        h-14
        bg-primary
        flex items-center
        justify-between
        px-4
        text-white
        z-50
      ">
        {/* Hamburger */}
        <button onClick={() => setMobileOpen(true)}>
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Center Logo */}
        <div className="w-auto h-auto px-2 rounded-lg bg-white flex items-center justify-center gap-2">
          <img src={logoIcon} alt="logo" className="w-6" /><h3 className="text-primary">5 DATA INC.</h3>
        </div>

        {/* Logout */}
        <button>
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SLIDE-IN SIDEBAR ================= */}
      <aside
        className={`
          sm:hidden
          fixed top-0 left-0
          h-full w-64
          bg-primary
          text-white
          z-50
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
          <img src={logoIcon} alt="logo" className="w-6" />
            <span className="font-semibold text-primary">5 DATA INC.</span>
          </div>
          <button onClick={() => setMobileOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="h-px bg-white/20 mb-4" />

        {/* Menu */}
        <nav className="flex flex-col gap-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-4 py-2 rounded-lg
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
