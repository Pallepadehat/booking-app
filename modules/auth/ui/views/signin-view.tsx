import AuthCard from "../components/auth-card";

export default function SignInView() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to Cut&apos;n Go</h1>
        <p className="text-muted-foreground text-sm">
          Use one of the following methods to sign in
        </p>
      </div>
      <AuthCard />
    </div>
  );
}
