import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, Gamepad2, LayoutDashboard, LogOut, Mail, Settings } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";

export const metadata = { title: "Administration — BOYE BA GAMING", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/jeux", label: "Jeux", icon: Gamepad2 },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar-brand" aria-label="Tableau de bord">
          <Image src="/images/boye-ba-logo.jpg" alt="BOYE BA GAMING" width={724} height={578} className="admin-sidebar-logo" />
          <span>ADMIN</span>
        </Link>
        <nav className="admin-nav" aria-label="Navigation administration">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="admin-nav-link">
              <Icon size={18} aria-hidden="true" /> <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
            <ExternalLink size={18} aria-hidden="true" /> <span>Voir le site</span>
          </a>
          <form action={logoutAction}>
            <button type="submit" className="admin-nav-link admin-logout"><LogOut size={18} aria-hidden="true" /> <span>Déconnexion</span></button>
          </form>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
