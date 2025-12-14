"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineDashboard } from "react-icons/ai";
import { BiScatterChart } from "react-icons/bi";
import { RiRobot2Line } from "react-icons/ri";
import { BsInfoCircle } from "react-icons/bs";
import { TbUpload } from "react-icons/tb";
import { MdFeedback } from "react-icons/md";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const items: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <AiOutlineDashboard size={18} /> },
  { href: "/clustering", label: "Clustering Wilayah", icon: <BiScatterChart size={18} /> },
  { href: "/tanyasdg", label: "TanyaSDGs", icon: <RiRobot2Line size={18} /> },
  { href: "/feedbacksdgs", label: "Feedback SDGs", icon: <MdFeedback size={18} /> },
  { href: "/updatedata", label: "Update Data", icon: <TbUpload size={18} /> },
  { href: "/tentang", label: "Tentang", icon: <BsInfoCircle size={18} /> }
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="glass-2 sticky top-0 z-30 w-full overflow-x-auto no-scrollbar rounded-2xl p-2 mb-3">
      <ul className="flex items-center gap-2 py-1 px-1 min-w-full overflow-x-auto no-scrollbar">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition min-w-[60px]
                  ${active ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
              >
                <span className="text-lg opacity-90">{it.icon}</span>
                <span className="text-[10px]">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
