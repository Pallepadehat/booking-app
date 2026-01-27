import AuthCard from "../components/auth-card";

export default function SignInView() {
  return (
    <div className="w-full h-full flex flex-col items-center gap-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to Cut&apos;n Go</h1>
        <p className="text-sm text-muted-foreground">
          Use one of the following methods to sign in
        </p>
      </div>
      <AuthCard />
    </div>
  );
}
