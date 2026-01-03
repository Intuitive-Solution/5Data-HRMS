import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logoIcon from "../../assests/sidebar/logo.png";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  FolderIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { STORAGE_KEYS } from "@5data-hrms/shared";
import type { RootState } from "@/store";

type MenuItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action?: () => void;
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Employees", href: "/employees", icon: UserGroupIcon },
    { name: "Leaves", href: "/leaves", icon: CalendarDaysIcon },
    { name: "Timesheets", href: "/timesheets", icon: ClockIcon },
    { name: "Projects", href: "/projects", icon: FolderIcon },
    { name: "Documents", href: "/documents", icon: DocumentTextIcon },
    { name: "Reports", href: "/reports", icon: DocumentChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* ================= DESKTOP & TABLET ================= */}
      <aside className="hidden sm:flex w-24 h-screen bg-primary flex-col items-center py-2 text-white rounded-r-2xl">
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

            // 🔴 LOGOUT (ACTION)
            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center">{item.name}</span>
                </button>
              );
            }

            // 🟢 ROUTE
            return (
              <NavLink
                key={item.name}
                to={item.href!}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `
                  relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/20 text-white hover:text-white"
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
      <header className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-primary flex items-center justify-between px-4 text-white z-50">
        <button onClick={() => setMobileOpen(true)}>
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div className="w-auto h-auto px-2 rounded-lg bg-white flex items-center gap-2">
          <img src={logoIcon} alt="logo" className="w-6" />
          <h3 className="text-primary">5 DATA INC.</h3>
        </div>

        <button
          onClick={() => setProfileOpen(true)}
          className="relative"
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
            />
          ) : (
            <UserCircleIcon className="w-8 h-8" />
          )}
        </button>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`
          sm:hidden fixed top-0 left-0 h-full w-64 bg-primary text-white z-50
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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

        <nav className="flex flex-col gap-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action?.();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href!}
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

      {/* ================= USER PROFILE POPUP (Bottom Sheet) ================= */}
      {profileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setProfileOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div
            className={`
              sm:hidden fixed bottom-0 left-0 right-0 z-[70]
              bg-white rounded-t-3xl shadow-2xl
              transform transition-transform duration-300 ease-out
              ${profileOpen ? "translate-y-0" : "translate-y-full"}
            `}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header with close button */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h3 className="text-lg font-semibold text-text-primary">Profile</h3>
              <button
                onClick={() => setProfileOpen(false)}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* User Avatar & Info */}
            <div className="flex flex-col items-center px-6 pb-6">
              <div className="relative mb-4">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {user?.first_name?.charAt(0)}
                      {user?.last_name?.charAt(0)}
                    </span>
                  </div>
                )}
                {user?.is_active && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckBadgeIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <h4 className="text-xl font-semibold text-text-primary">
                {user?.first_name} {user?.last_name}
              </h4>
              <p className="text-sm text-text-secondary mt-1">{user?.email}</p>
            </div>

            {/* User Details */}
            <div className="mx-6 bg-surface rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-divider/30">
                <span className="text-sm text-text-secondary">Status</span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  user?.is_active 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="py-2">
                <span className="text-sm text-text-secondary block mb-2">Roles</span>
                <div className="flex flex-wrap gap-2">
                  {user?.roles?.map((role) => (
                    <span
                      key={role}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary"
                    >
                      {formatRole(role)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
