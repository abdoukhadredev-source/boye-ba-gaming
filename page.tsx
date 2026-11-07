import { Info } from "lucide-react";
import { PasswordForm } from "@/components/admin/forms";
import { socialLinks } from "@/data/games";

export default function AdminSettingsPage() {
  return (
    <>
      <header className="admin-page-head">
        <div>
          <span className="admin-kicker">SÉCURITÉ</span>
          <h1>Paramètres</h1>
          <p>Gère l&apos;accès à l&apos;espace d&apos;administration.</p>
        </div>
      </header>

      <div className="admin-two-col">
        <section className="admin-card">
          <h2 className="admin-card-title">Changer le mot de passe</h2>
          <PasswordForm />
        </section>

        <section className="admin-card">
          <h2 className="admin-card-title">Informations</h2>
          <ul className="admin-info-list">
            <li><Info size={16} aria-hidden="true" /> Le mot de passe initial provient de la variable <code>ADMIN_PASSWORD</code> (ou d&apos;une valeur par défaut). Change-le dès la première connexion.</li>
            <li><Info size={16} aria-hidden="true" /> Les sessions durent 12 heures et sont automatiquement invalidées lorsque le mot de passe change.</li>
            <li><Info size={16} aria-hidden="true" /> Les images téléversées sont stockées dans la base de données et servies via <code>/api/media</code>.</li>
          </ul>
          <h2 className="admin-card-title admin-card-title-gap">Réseaux officiels</h2>
          <ul className="admin-info-list admin-info-links">
            <li><span>TikTok</span><a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="admin-link">@boye_ba_gaming</a></li>
            <li><span>YouTube</span><a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="admin-link">@boye_ba_gaming</a></li>
            <li><span>Telegram</span><a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="admin-link">@boye_ba_gaming</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}
