import { XMLParser } from "fast-xml-parser";
export type Post = {
  title: string;
  link: string;
  date: string;
  category: string;
};
export async function getPosts(): Promise<Post[]> {
  try {
    const r = await fetch("https://jimin0703.tistory.com/rss", {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return [];
    const xml = new XMLParser({
      ignoreAttributes: false,
      processEntities: true,
    }).parse(await r.text());
    const items = xml.rss?.channel?.item;
    return (Array.isArray(items) ? items : items ? [items] : [])
      .slice(0, 3)
      .filter(
        (p: any) =>
          typeof p.link === "string" &&
          p.link.startsWith("https://jimin0703.tistory.com/"),
      )
      .map((p: any) => ({
        title: String(p.title || "블로그 글"),
        link: p.link,
        date: Number.isNaN(Date.parse(p.pubDate))
          ? ""
          : new Date(p.pubDate).toLocaleDateString("ko-KR"),
        category: typeof p.category === "string" ? p.category : "개발 기록",
      }));
  } catch {
    return [];
  }
}
