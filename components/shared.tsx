import { ArrowUpRight } from "lucide-react";
export function External({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}
export function PageTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{number} / PORTFOLIO</span>
      <h1>
        {title}
        <span className="accent">.</span>
      </h1>
      {description && <p>{description}</p>}
    </div>
  );
}
