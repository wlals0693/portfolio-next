import type { Metadata } from "next";
import Header from "@/components/header";
import { External } from "@/components/shared";
import { profile } from "@/lib/content";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "박지민 | Portfolio", template: "%s | 박지민 Portfolio" },
  description: "배우고 만들고 기록하는 개발자 박지민의 포트폴리오",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch{}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          본문 바로가기
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer>
          <div className="footer-inner">
            <div>
              <strong>
                Portfolio<span className="accent">.</span>
              </strong>
              <p>하나씩 만들고, 꾸준히 기록합니다.</p>
            </div>
            <div className="footer-links">
              <External href={profile.github}>GitHub</External>
              <External href={profile.blog}>Blog</External>
              <span>© 2026 박지민</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
