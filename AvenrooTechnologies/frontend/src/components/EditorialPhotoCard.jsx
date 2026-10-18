export default function EditorialPhotoCard({
  src,
  alt,
  label,
  title,
  detail,
  className = "",
  loading = "lazy",
  fetchPriority,
}) {
  return (
    <article className={`editorial-photo ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />

      <div className="editorial-photo__content">
        {label ? <p className="editorial-photo__label">{label}</p> : null}
        <h3 className="editorial-photo__title">{title}</h3>
        {detail ? <p className="editorial-photo__detail">{detail}</p> : null}
      </div>
    </article>
  );
}
