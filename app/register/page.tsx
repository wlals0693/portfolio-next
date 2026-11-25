import AuthForm from "@/components/auth-form";
export const metadata = { title: "회원가입" };
export default function Register() {
  return (
    <div className="container auth-page">
      <h1>회원가입</h1>
      <AuthForm register />
    </div>
  );
}
