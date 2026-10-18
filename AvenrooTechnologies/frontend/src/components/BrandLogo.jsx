export default function BrandLogo({ className = "", title = "Avenroo Technologies" }) {
  return (
    <span className={`avenroo-wordmark ${className}`} role="img" aria-label={title}>
      <svg className="avenroo-wordmark__symbol" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="46" height="46" rx="15" fill="#E8F4F1" />
        <path d="m7.5 35 10.1-22h6.3L34 35h-8.2l-1.6-4.4h-8.1L14.3 35H7.5Zm11.1-10h3.2l-1.6-4.7-1.6 4.7Z" fill="#123A36" />
        <path d="m22.8 13 7.3 22h7.1l-8.3-22h-6.1Z" fill="#20B69F" />
      </svg>
      <span className="avenroo-wordmark__type">
        <span className="avenroo-wordmark__name">Avenroo</span>
        <span className="avenroo-wordmark__descriptor">Technologies</span>
      </span>
    </span>
  );
}
