"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  Gamepad2,
  Headphones,
  Mail,
  Menu,
  Monitor,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { SiTelegram, SiTiktok, SiYoutube } from "react-icons/si";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { categories, socialLinks, type Game, type GameCategory } from "@/data/games";

const navItems = [
  { label: "Accueil", href: "#accueil", id: "accueil" },
  { label: "Tous les jeux", href: "#jeux", id: "jeux" },
  { label: "Nouveautés", href: "#nouveautes", id: "nouveautes" },
  { label: "À propos", href: "#apropos", id: "apropos" },
  { label: "Contact", href: "#contact", id: "contact" },
];

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");

function BrandLogo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/images/boye-ba-logo.jpg"
      alt="BOYE BA GAMING"
      width={724}
      height={578}
      priority={priority}
      className={`brand-logo ${className}`}
    />
  );
}

function DownloadButton({
  game,
  onUnavailable,
  className = "",
}: {
  game: Game;
  onUnavailable: (title: string) => void;
  className?: string;
}) {
  const content = (
    <>
      <Download size={16} strokeWidth={2.3} aria-hidden="true" />
      <span>TÉLÉCHARGER</span>
    </>
  );

  if (!game.downloadUrl) {
    return (
      <button
        type="button"
        className={`button button-red ${className}`}
        onClick={() => onUnavailable(game.title)}
        aria-label={`Lien indisponible pour ${game.title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className={`button button-red ${className}`}
      href={game.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Télécharger ${game.title} (ouvre un nouvel onglet)`}
    >
      {content}
    </a>
  );
}

function GameCard({
  game,
  onDetails,
  onUnavailable,
}: {
  game: Game;
  onDetails: (game: Game) => void;
  onUnavailable: (title: string) => void;
}) {
  return (
    <article className="game-card">
      <div className="game-card-visual">
        <button
          type="button"
          className="game-art-button"
          onClick={() => onDetails(game)}
          aria-label={`En savoir plus sur ${game.title}`}
        >
          <Image
            src={game.image}
            alt={`Visuel promotionnel de ${game.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="game-art-image"
          />
          <span className="game-image-shade" aria-hidden="true" />
        </button>
        <span className={`game-badge ${game.badge ? "game-badge-featured" : ""}`}>
          {game.badge ?? game.category}
        </span>
        <span className="game-visual-arrow" aria-hidden="true">
          <ArrowUpRight size={19} />
        </span>
      </div>

      <div className="game-card-content">
        <div className="game-card-meta">
          <span className="game-category"><span className="tiny-red-dot" />{game.category}</span>
          <span className="game-platform"><Monitor size={13} aria-hidden="true" /> {game.platform}</span>
        </div>
        <h3>{game.title}</h3>
        <p className="game-description">{game.description}</p>
        <div className="game-card-actions">
          <DownloadButton game={game} onUnavailable={onUnavailable} />
          <button type="button" className="button button-outline" onClick={() => onDetails(game)}>
            EN SAVOIR PLUS <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

type ContactStatus = { type: "success" | "error"; message: string } | null;

export default function GamingPlatform({ games }: { games: Game[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("accueil");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<GameCategory | "Tous">("Tous");
  const [sort, setSort] = useState<"recent" | "az" | "za">("recent");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [unavailableNotice, setUnavailableNotice] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", message: "", website: "" });
  const [contactStatus, setContactStatus] = useState<ContactStatus>(null);
  const [sending, setSending] = useState(false);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const filteredGames = useMemo(() => {
    const term = normalize(search.trim());
    const matches = games.filter((game) => {
      const matchesName = !term || normalize(`${game.title} ${game.subtitle}`).includes(term);
      const matchesCategory = category === "Tous" || game.categories.includes(category);
      return matchesName && matchesCategory;
    });

    return matches.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title, "fr", { numeric: true });
      if (sort === "za") return b.title.localeCompare(a.title, "fr", { numeric: true });
      return b.addedOrder - a.addedOrder;
    });
  }, [games, search, category, sort]);

  const newestGames = useMemo(
    () => [...games].sort((a, b) => b.addedOrder - a.addedOrder).slice(0, 3),
    [games],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: 0 },
    );
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileOpen]);

  useEffect(() => {
    if (!selectedGame) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetails();
      if (event.key !== "Tab") return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedGame]);

  const openDetails = (game: Game) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setSelectedGame(game);
  };

  const closeDetails = () => {
    setSelectedGame(null);
    requestAnimationFrame(() => previousFocusRef.current?.focus());
  };

  const showUnavailable = (title: string) => {
    setUnavailableNotice(`Le lien de ${title} n'est pas disponible pour le moment. Aucun autre lien non vérifié ne te sera proposé.`);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("Tous");
    setSort("recent");
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setContactStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "Une erreur est survenue.");
      setContact({ name: "", email: "", message: "", website: "" });
      setContactStatus({ type: "success", message: "Message envoyé ! Merci, nous avons bien reçu ta demande." });
    } catch (error) {
      setContactStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Impossible d'envoyer le message. Réessaie plus tard.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>

      <div className="topbar">
        <div className="container topbar-inner">
          <span><span className="live-dot" /> LA DESTINATION GAMING DE LA COMMUNAUTÉ</span>
          <span className="topbar-right">TES JEUX. TON UNIVERS. TA COMMUNAUTÉ. <Zap size={12} fill="currentColor" aria-hidden="true" /></span>
        </div>
      </div>

      <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
        <div className="container header-inner">
          <a className="header-brand" href="#accueil" aria-label="BOYE BA GAMING — Retour à l'accueil" onClick={() => setMobileOpen(false)}>
            <BrandLogo priority />
          </a>

          <nav className="desktop-nav" aria-label="Navigation principale">
            {navItems.map((item) => (
              <a key={item.id} className={activeSection === item.id ? "nav-active" : ""} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="button button-red header-cta" href="#jeux">
            DÉCOUVRIR LES JEUX <ArrowUpRight size={17} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
        {mobileOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Navigation mobile">
            {navItems.map((item, index) => (
              <a key={item.id} href={item.href} onClick={() => setMobileOpen(false)}>
                <span className="mobile-nav-index">0{index + 1}</span>{item.label}<ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
            <a className="button button-red mobile-nav-cta" href="#jeux" onClick={() => setMobileOpen(false)}>
              DÉCOUVRIR LES JEUX <ArrowRight size={17} aria-hidden="true" />
            </a>
          </nav>
        )}
      </header>

      <main id="contenu">
        <section className="hero" id="accueil" aria-labelledby="hero-title">
          <Image
            src="/images/hero-gaming.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={88}
            className="hero-background"
          />
          <div className="hero-gradient" aria-hidden="true" />
          <div className="hero-grid-texture" aria-hidden="true" />

          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="hero-eyebrow"><span className="hero-eyebrow-bar" /> LE HUB GAMING OFFICIEL <span className="hero-eyebrow-line" /></div>
              <h1 id="hero-title">
                BIENVENUE DANS<br />
                L&apos;UNIVERS<br />
                BOYE BA <span>GAMING</span>
              </h1>
              <p>Retrouve tous les jeux présentés sur TikTok au même endroit !</p>
              <div className="hero-actions">
                <a className="button button-red button-hero" href="#jeux">
                  EXPLORER LES JEUX <ArrowUpRight size={19} aria-hidden="true" />
                </a>
                <a className="button button-ghost button-hero" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                  <SiTelegram size={19} aria-hidden="true" /> REJOINDRE TELEGRAM
                </a>
              </div>
              <div className="hero-micro"><span className="micro-line" /> DÉCOUVRE. JOUE. PARTAGE.</div>
            </div>

            <div className="hero-brand-card" aria-label="BOYE BA GAMING, hub officiel">
              <BrandLogo className="hero-card-logo" />
              <div className="hero-brand-card-bottom"><span className="live-dot" /> OFFICIAL GAMING HUB <ArrowUpRight size={14} aria-hidden="true" /></div>
            </div>
          </div>

          <a href="#jeux" className="hero-scroll" aria-label="Défiler vers les jeux">
            <span>SCROLL POUR EXPLORER</span><ArrowDown size={16} aria-hidden="true" />
          </a>
        </section>

        <div className="stats-strip" aria-label="La plateforme en quelques chiffres">
          <div className="container stats-inner">
            <div className="stat-item"><div className="stat-icon"><Gamepad2 size={23} strokeWidth={1.7} aria-hidden="true" /></div><div><strong>{String(games.length).padStart(2, "0")}</strong><span>JEUX À DÉCOUVRIR</span></div></div>
            <div className="stat-item"><div className="stat-icon"><UsersRound size={22} strokeWidth={1.7} aria-hidden="true" /></div><div><strong>01</strong><span>COMMUNAUTÉ PASSIONNÉE</span></div></div>
            <div className="stat-item"><div className="stat-icon"><Zap size={22} strokeWidth={1.7} aria-hidden="true" /></div><div><strong>100<span className="stat-percent">%</span></strong><span>PASSION GAMING</span></div></div>
          </div>
        </div>

        <section className="catalog-section section-pad" id="jeux" aria-labelledby="catalog-title">
          <div className="container">
            <div className="section-heading catalog-heading">
              <div>
                <div className="section-kicker"><span className="kicker-line" /> 01 / LA BIBLIOTHÈQUE</div>
                <h2 id="catalog-title">TROUVE TON <span>PROCHAIN JEU.</span></h2>
                <p>Tous les jeux présentés dans les vidéos de BOYE BA GAMING, réunis pour toi.</p>
              </div>
              <div className="catalog-count"><Gamepad2 size={17} aria-hidden="true" /> {String(games.length).padStart(2, "0")} JEUX DISPONIBLES</div>
            </div>

            <div className="catalog-tools">
              <label className="search-box">
                <Search size={19} aria-hidden="true" />
                <span className="sr-only">Rechercher un jeu par son nom</span>
                <input
                  type="search"
                  placeholder="Rechercher un jeu..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Rechercher un jeu par son nom"
                />
                {search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={17} /></button>}
              </label>
              <div className="sort-box">
                <span className="sort-label">TRIER PAR</span>
                <div className="sort-select-wrap">
                  <select aria-label="Trier les jeux" value={sort} onChange={(event) => setSort(event.target.value as "recent" | "az" | "za")}>
                    <option value="recent">Nouveautés</option>
                    <option value="az">Nom : A à Z</option>
                    <option value="za">Nom : Z à A</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="filter-row" role="group" aria-label="Filtrer les jeux par catégorie">
              <button type="button" className={`filter-chip ${category === "Tous" ? "filter-chip-active" : ""}`} onClick={() => setCategory("Tous")}>TOUS LES JEUX <span>{String(games.length).padStart(2, "0")}</span></button>
              {categories.map((item) => (
                <button key={item} type="button" className={`filter-chip ${category === item ? "filter-chip-active" : ""}`} onClick={() => setCategory(item)}>{item.toUpperCase()}</button>
              ))}
            </div>

            <div className="results-line" aria-live="polite">
              <span><span className="tiny-red-dot" /> {filteredGames.length} {filteredGames.length === 1 ? "JEU TROUVÉ" : "JEUX TROUVÉS"}</span>
              {(search || category !== "Tous" || sort !== "recent") && <button type="button" onClick={resetFilters}><RotateCcw size={13} aria-hidden="true" /> RÉINITIALISER</button>}
            </div>

            {filteredGames.length ? (
              <div className="game-grid">
                {filteredGames.map((game) => <GameCard key={game.id} game={game} onDetails={openDetails} onUnavailable={showUnavailable} />)}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={35} strokeWidth={1.5} aria-hidden="true" />
                <h3>AUCUN JEU TROUVÉ</h3>
                <p>Essaie un autre nom ou une autre catégorie pour retrouver ton prochain jeu.</p>
                <button className="button button-red" type="button" onClick={resetFilters}>VOIR TOUS LES JEUX <ArrowRight size={16} aria-hidden="true" /></button>
              </div>
            )}
          </div>
        </section>

        <section className="new-section section-pad" id="nouveautes" aria-labelledby="new-title">
          <div className="container">
            <div className="section-heading new-heading">
              <div>
                <div className="section-kicker"><span className="kicker-line" /> 02 / EN CE MOMENT</div>
                <h2 id="new-title">DANS LE <span>RADAR.</span></h2>
                <p>Les derniers jeux ajoutés à la sélection. La prochaine aventure est peut-être ici.</p>
              </div>
              <a href="#jeux" className="text-link">VOIR TOUTE LA COLLECTION <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
            <div className="new-grid">
              {newestGames.map((game, index) => (
                <button type="button" key={game.id} className="new-card" onClick={() => openDetails(game)} aria-label={`Découvrir ${game.title}`}>
                  <Image src={game.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" className="new-card-image" />
                  <span className="new-card-shade" aria-hidden="true" />
                  <span className="new-card-number">0{index + 1} / 0{newestGames.length}</span>
                  <span className="new-card-bottom"><span><small>À DÉCOUVRIR</small><strong>{game.title}</strong></span><span className="new-card-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="community-section section-pad" id="communaute" aria-labelledby="community-title">
          <div className="community-glow" aria-hidden="true" />
          <div className="container community-content">
            <div className="section-heading community-heading">
              <div>
                <div className="section-kicker"><span className="kicker-line" /> 03 / CONNECTE-TOI</div>
                <h2 id="community-title">REJOINS LA COMMUNAUTÉ <span>BOYE BA GAMING.</span></h2>
                <p>Ne manque aucune vidéo, aucune découverte et aucun nouveau jeu. On se retrouve sur les réseaux !</p>
              </div>
            </div>
            <div className="social-grid">
              <a className="social-card social-tiktok" href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="S'abonner à BOYE BA GAMING sur TikTok (nouvel onglet)">
                <div className="social-card-top"><span className="social-icon"><SiTiktok size={29} aria-hidden="true" /></span><ArrowUpRight size={20} aria-hidden="true" /></div>
                <div><span className="social-overline">VIDÉOS & DÉCOUVERTES</span><h3>TIKTOK</h3><p>@boye_ba_gaming</p></div>
                <span className="social-follow">S&apos;ABONNER <ArrowRight size={17} aria-hidden="true" /></span>
              </a>
              <a className="social-card social-youtube" href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="S'abonner à BOYE BA GAMING sur YouTube (nouvel onglet)">
                <div className="social-card-top"><span className="social-icon"><SiYoutube size={30} aria-hidden="true" /></span><ArrowUpRight size={20} aria-hidden="true" /></div>
                <div><span className="social-overline">CONTENUS & VIDÉOS</span><h3>YOUTUBE</h3><p>@boye_ba_gaming</p></div>
                <span className="social-follow">S&apos;ABONNER <ArrowRight size={17} aria-hidden="true" /></span>
              </a>
              <a className="social-card social-telegram" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Rejoindre BOYE BA GAMING sur Telegram (nouvel onglet)">
                <div className="social-card-top"><span className="social-icon"><SiTelegram size={30} aria-hidden="true" /></span><ArrowUpRight size={20} aria-hidden="true" /></div>
                <div><span className="social-overline">LA COMMUNAUTÉ EN DIRECT</span><h3>TELEGRAM</h3><p>@boye_ba_gaming</p></div>
                <span className="social-follow">REJOINDRE <ArrowRight size={17} aria-hidden="true" /></span>
              </a>
            </div>
            <div className="community-bottom"><Sparkles size={17} aria-hidden="true" /> SUIS BOYE BA SUR TIKTOK ET YOUTUBE, PUIS REJOINS LE GROUPE TELEGRAM POUR NE RIEN RATER.</div>
          </div>
        </section>

        <section className="about-section section-pad" id="apropos" aria-labelledby="about-title">
          <div className="container about-grid">
            <div className="about-visual">
              <div className="about-visual-grid" aria-hidden="true" />
              <span className="about-corner about-corner-tl" aria-hidden="true" /><span className="about-corner about-corner-br" aria-hidden="true" />
              <BrandLogo className="about-brand-logo" />
              <div className="about-visual-footer"><span className="live-dot" /> DE LA PASSION AU PARTAGE <span>HUB OFFICIEL</span></div>
            </div>
            <div className="about-copy">
              <div className="section-kicker"><span className="kicker-line" /> 04 / L&apos;HISTOIRE</div>
              <h2 id="about-title">QUI EST <span>BOYE BA GAMING ?</span></h2>
              <p className="about-lead">Un créateur. Une communauté. Une passion commune pour le jeu.</p>
              <p>BOYE BA GAMING est un créateur de contenu passionné par l&apos;univers du gaming. À travers ses vidéos, il partage avec sa communauté des jeux, des découvertes et des expériences gaming. Cette plateforme permet à ses abonnés de retrouver facilement tous les jeux présentés dans ses contenus.</p>
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-link about-link">DÉCOUVRIR SES VIDÉOS <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title">
          <div className="container contact-grid">
            <div className="contact-copy">
              <div className="section-kicker"><span className="kicker-line" /> 05 / PARLONS GAMING</div>
              <h2 id="contact-title">UNE QUESTION ? <span>ON EST LÀ.</span></h2>
              <p>Un jeu à suggérer, une question ou un lien à signaler ? Écris-nous directement via ce formulaire ou retrouve la communauté sur Telegram.</p>
              <div className="contact-method"><span className="contact-method-icon"><Headphones size={24} aria-hidden="true" /></span><span><strong>LA COMMUNAUTÉ T&apos;ATTEND</strong><small>Rejoins les échanges sur Telegram.</small></span></div>
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-link contact-telegram">ÉCRIRE SUR TELEGRAM <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
            <form className="contact-form" onSubmit={submitContact}>
              <div className="form-top"><span><Mail size={19} aria-hidden="true" /> ENVOIE-NOUS UN MESSAGE</span><span className="form-top-mark">● EN LIGNE</span></div>
              <div className="form-row">
                <label>TON NOM <span>*</span><input type="text" name="name" placeholder="Ton nom" minLength={2} maxLength={120} required autoComplete="name" value={contact.name} onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))} /></label>
                <label>TON E-MAIL <span>*</span><input type="email" name="email" placeholder="ton@email.com" maxLength={255} required autoComplete="email" value={contact.email} onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))} /></label>
              </div>
              <label>TON MESSAGE <span>*</span><textarea name="message" placeholder="Dis-nous ce que tu as en tête..." minLength={10} maxLength={2000} rows={5} required value={contact.message} onChange={(event) => setContact((prev) => ({ ...prev, message: event.target.value }))} /></label>
              <div className="honeypot" aria-hidden="true"><label>Site web<input type="text" name="website" tabIndex={-1} autoComplete="off" value={contact.website} onChange={(event) => setContact((prev) => ({ ...prev, website: event.target.value }))} /></label></div>
              {contactStatus && <p className={`form-status ${contactStatus.type}`} role={contactStatus.type === "error" ? "alert" : "status"}>{contactStatus.type === "success" && <CheckCircle2 size={17} aria-hidden="true" />}{contactStatus.message}</p>}
              <button className="button button-red form-submit" type="submit" disabled={sending}>{sending ? "ENVOI EN COURS..." : "ENVOYER LE MESSAGE"} <Send size={17} aria-hidden="true" /></button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand-block">
            <a href="#accueil" aria-label="BOYE BA GAMING — Retour en haut"><BrandLogo className="footer-logo" /></a>
            <p>Le point de rendez-vous de tous les jeux présentés par BOYE BA GAMING. Découvre, explore et partage ta passion.</p>
            <div className="footer-socials">
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok (nouvel onglet)"><SiTiktok size={18} /></a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube (nouvel onglet)"><SiYoutube size={18} /></a>
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram (nouvel onglet)"><SiTelegram size={18} /></a>
            </div>
          </div>
          <div className="footer-links"><h3>EXPLORER</h3><a href="#accueil">Accueil</a><a href="#jeux">Tous les jeux</a><a href="#nouveautes">Nouveautés</a><a href="#apropos">À propos</a><a href="#contact">Contact</a></div>
          <div className="footer-links"><h3>LA COMMUNAUTÉ</h3><a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer">TikTok <ArrowUpRight size={14} aria-hidden="true" /></a><a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight size={14} aria-hidden="true" /></a><a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">Telegram <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          <div className="footer-cta-block"><span className="footer-cta-icon"><Gamepad2 size={25} aria-hidden="true" /></span><h3>PRÊT POUR LA<br />PROCHAINE PARTIE ?</h3><a href="#jeux" className="button button-red">VOIR LES JEUX <ArrowRight size={17} aria-hidden="true" /></a></div>
        </div>
        <div className="container footer-disclaimer"><ShieldCheck size={17} aria-hidden="true" /><p>Avant tout téléchargement, vérifie la compatibilité de ton appareil ainsi que la légalité et la sécurité des fichiers dans ton pays. Les liens mènent vers des sites externes.</p></div>
        <div className="footer-bottom"><div className="container footer-bottom-inner"><span>© 2026 BOYE BA GAMING. Tous droits réservés.</span><span>FAIT POUR LES PASSIONNÉS DE GAMING <span className="footer-heart">♥</span></span><span style={{ display: "inline-flex", gap: 18 }}><a href="/admin" className="footer-admin-link" rel="nofollow">ADMIN</a><a href="#accueil">RETOUR EN HAUT ↑</a></span></div></div>
      </footer>

      {selectedGame && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
          <div ref={modalRef} className="game-modal" role="dialog" aria-modal="true" aria-labelledby="game-modal-title" aria-describedby="game-modal-description">
            <button ref={modalCloseRef} type="button" className="modal-close" onClick={closeDetails} aria-label="Fermer la fiche du jeu"><X size={22} /></button>
            <div className="modal-art"><Image src={selectedGame.portrait} alt={`Visuel promotionnel de ${selectedGame.title}`} fill sizes="(max-width: 700px) 100vw, 40vw" /><span className="modal-art-shade" /></div>
            <div className="modal-content">
              <div className="section-kicker"><span className="kicker-line" /> FICHE DU JEU</div>
              <h2 id="game-modal-title">{selectedGame.title}</h2>
              <p className="modal-subtitle">{selectedGame.subtitle}</p>
              <p className="modal-description" id="game-modal-description">{selectedGame.longDescription}</p>
              <div className="modal-details"><div><span>GENRES</span><strong>{selectedGame.categories.join(" · ")}</strong></div><div><span>PLATEFORME</span><strong><Monitor size={17} aria-hidden="true" /> {selectedGame.platform}</strong></div></div>
              <DownloadButton game={selectedGame} onUnavailable={showUnavailable} className="modal-download" />
              <p className="modal-note"><ShieldCheck size={16} aria-hidden="true" /> Lien externe fourni par BOYE BA GAMING. Vérifie la compatibilité, la sécurité et la légalité du fichier avant de télécharger.</p>
              <a className="modal-report" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">Un lien ne fonctionne plus ? Signale-le sur Telegram <ExternalLink size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      )}

      {unavailableNotice && <div className="notice-toast" role="status"><ShieldCheck size={20} aria-hidden="true" /><p>{unavailableNotice}</p><button type="button" onClick={() => setUnavailableNotice("")} aria-label="Fermer le message"><X size={17} /></button></div>}
    </>
  );
}
