const toneClasses = {
  light: "poster-card poster-card--light",
  soft: "poster-card poster-card--soft",
  dark: "poster-card poster-card--dark",
};

export default function PosterCard({
  eyebrow,
  title,
  copy,
  items = [],
  tone = "light",
  className = "",
}) {
  const cardClassName = toneClasses[tone] || toneClasses.light;

  return (
    <article className={`${cardClassName} ${className}`.trim()}>
      <div className="poster-card__accent" aria-hidden="true" />
      {eyebrow ? <p className="poster-card__eyebrow">{eyebrow}</p> : null}
      <h3 className="poster-card__title">{title}</h3>
      {copy ? <p className="poster-card__copy">{copy}</p> : null}

      {items.length ? (
        <div className="poster-card__items">
          {items.map((item) => (
            <span key={item} className="poster-card__item">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
