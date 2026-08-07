/**
 * Пути к файлам из public/ с учётом base.
 *
 * На своём домене сайт живёт в корне, на github.io — в подкаталоге
 * /<repo>/. Astro сам подставляет base в свои ассеты (CSS), но пути,
 * прописанные руками, нужно приводить этой функцией.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
