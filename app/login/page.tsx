import AuthForm from "@/components/auth-form";
export const metadata = { title: "로그인" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="container auth-page">
      <h1>로그인</h1>
      {query.registered && <p>가입되었습니다. 로그인해주세요.</p>}
      <AuthForm />
    </div>
  );
}
