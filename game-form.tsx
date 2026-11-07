"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import Link from "next/link";
import { categories } from "@/data/games";
import { saveGameAction, type ActionState } from "@/app/admin/actions";

export type GameFormValues = {
  id?: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categories: string[];
  description: string;
  longDescription: string;
  platform: string;
  image: string;
  portrait: string;
  downloadUrl: string;
  badge: string;
  published: boolean;
  sortOrder: number;
};

export default function GameForm({ initial }: { initial: GameFormValues }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveGameAction, null);
  const [imagePreview, setImagePreview] = useState(initial.image);
  const [portraitPreview, setPortraitPreview] = useState(initial.portrait);

  const previewFile = (file: File | undefined, setter: (value: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <form action={formAction} className="admin-form" encType="multipart/form-data">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="admin-form-grid">
        <section className="admin-card">
          <h2 className="admin-card-title">Informations du jeu</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Nom du jeu *</span>
              <input name="title" defaultValue={initial.title} required maxLength={120} placeholder="Ex. GTA 5" />
            </label>
            <label className="admin-field">
              <span>Sous-titre</span>
              <input name="subtitle" defaultValue={initial.subtitle} maxLength={160} placeholder="Ex. Grand Theft Auto V" />
            </label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Catégorie principale *</span>
              <select name="category" defaultValue={initial.category} required>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Plateforme</span>
              <input name="platform" defaultValue={initial.platform} maxLength={120} placeholder="Ex. PC · PlayStation" />
            </label>
          </div>
          <fieldset className="admin-field admin-fieldset">
            <legend>Catégories associées (filtres)</legend>
            <div className="admin-check-grid">
              {categories.map((item) => (
                <label key={item} className="admin-check">
                  <input type="checkbox" name="categories" value={item} defaultChecked={initial.categories.includes(item)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="admin-field">
            <span>Description courte * <small>(affichée sur la carte)</small></span>
            <textarea name="description" defaultValue={initial.description} required minLength={10} maxLength={400} rows={3} />
          </label>
          <label className="admin-field">
            <span>Description longue <small>(fiche détaillée)</small></span>
            <textarea name="longDescription" defaultValue={initial.longDescription} maxLength={3000} rows={5} />
          </label>
        </section>

        <div className="admin-form-side">
          <section className="admin-card">
            <h2 className="admin-card-title">Téléchargement</h2>
            <label className="admin-field">
              <span>Lien de téléchargement</span>
              <input name="downloadUrl" type="url" defaultValue={initial.downloadUrl} placeholder="https://..." />
              <small className="admin-hint">Laisse vide si le lien n&apos;est pas disponible : le site affichera un message au lieu de rediriger.</small>
            </label>
            <div className="admin-field-row">
              <label className="admin-field">
                <span>Badge</span>
                <input name="badge" defaultValue={initial.badge} maxLength={40} placeholder="Ex. À LA UNE" />
              </label>
              <label className="admin-field">
                <span>Ordre (plus grand = plus récent)</span>
                <input name="sortOrder" type="number" defaultValue={initial.sortOrder} />
              </label>
            </div>
            <label className="admin-field">
              <span>Identifiant (slug)</span>
              <input name="slug" defaultValue={initial.slug} maxLength={120} placeholder="généré automatiquement" />
            </label>
            <label className="admin-switch">
              <input type="checkbox" name="published" defaultChecked={initial.published} />
              <span>Visible sur le site public</span>
            </label>
          </section>

          <section className="admin-card">
            <h2 className="admin-card-title">Images</h2>
            <div className="admin-media-block">
              <div className="admin-media-preview admin-media-landscape">
                {imagePreview ? <img src={imagePreview} alt="" /> : <span>Aucune image</span>}
              </div>
              <label className="admin-field">
                <span>Image principale * <small>(format paysage)</small></span>
                <input name="image" defaultValue={initial.image} placeholder="/images/games/... ou https://..." onChange={(e) => setImagePreview(e.target.value)} />
              </label>
              <label className="admin-upload">
                <UploadCloud size={17} aria-hidden="true" /> Téléverser un fichier
                <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => previewFile(e.target.files?.[0], setImagePreview)} />
              </label>
            </div>
            <div className="admin-media-block">
              <div className="admin-media-preview admin-media-portrait">
                {portraitPreview ? <img src={portraitPreview} alt="" /> : <span>Aucune image</span>}
              </div>
              <label className="admin-field">
                <span>Image portrait <small>(fiche détaillée)</small></span>
                <input name="portrait" defaultValue={initial.portrait} placeholder="Optionnel" onChange={(e) => setPortraitPreview(e.target.value)} />
              </label>
              <label className="admin-upload">
                <UploadCloud size={17} aria-hidden="true" /> Téléverser un fichier
                <input type="file" name="portraitFile" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => previewFile(e.target.files?.[0], setPortraitPreview)} />
              </label>
            </div>
            <small className="admin-hint">JPG, PNG, WEBP ou GIF — 3 Mo max. Les fichiers téléversés sont stockés dans la base de données.</small>
          </section>
        </div>
      </div>

      {state?.error && <p className="admin-alert admin-alert-error" role="alert">{state.error}</p>}

      <div className="admin-form-actions">
        <Link href="/admin/jeux" className="admin-btn admin-btn-ghost"><ArrowLeft size={16} aria-hidden="true" /> Retour</Link>
        <button type="submit" className="admin-btn admin-btn-red" disabled={pending}>
          <Save size={16} aria-hidden="true" /> {pending ? "Enregistrement..." : initial.id ? "Enregistrer les modifications" : "Ajouter le jeu"}
        </button>
      </div>
    </form>
  );
}
