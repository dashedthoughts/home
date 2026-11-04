import { SITE } from '../data/content.js';
import { useEffect, useState } from 'react';


const IMG = /\.(jpe?g|png|gif|webp|avif)$/i;

// Reads /photos from the repo at runtime: dropping a file in that folder is all it takes.
export default function PhotoStrip() {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    // the folder listing is cached for the session (GitHub allows 60 unauthenticated calls an hour)
    const key = 'nc2:photos:' + SITE.photosRepo + '/' + SITE.photosFolder;
    const local = SITE.photosRepo === 'dashedthoughts/home'; // same site: serve from Pages' CDN, not raw GitHub
    const show = (list) => setPhotos(list.filter((f) => IMG.test(f.name)).slice(0, 16).map((f) => ({ src: local ? `${SITE.photosFolder}/${f.name}` : f.download_url, name: f.name })));
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch { /* private mode */ }
    if (cached) { show(cached); return; }
    fetch(`https://api.github.com/repos/${SITE.photosRepo}/contents/${SITE.photosFolder}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const files = (Array.isArray(list) ? list : []).map((f) => ({ name: f.name, download_url: f.download_url }));
        try { sessionStorage.setItem(key, JSON.stringify(files)); } catch { /* ignore */ }
        show(files);
      })
      .catch(() => {});
  }, []);
  const items = photos.length ? photos : Array.from({ length: 5 }, () => null);
  const loop = [...items, ...items];
  return (
    <div className="photos">
      <div className="photos__track" style={{ '--count': items.length }}>
        {loop.map((p, i) => (
          <figure className="photo" key={i} aria-hidden={i >= items.length ? 'true' : undefined}>
            {p ? (
              <img src={p.src} alt={p.name.replace(IMG, '').replace(/[-_]/g, ' ')} loading="lazy" />
            ) : (
              <span className="photo__empty">
                NO SIGNAL
                <br />
                /photos
              </span>
            )}
            <figcaption>CAM {String((i % items.length) + 1).padStart(2, '0')}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
