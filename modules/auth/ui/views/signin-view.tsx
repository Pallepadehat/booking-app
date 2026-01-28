import AuthCard from "../components/auth-card";

export default function SignInView() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Velkommen til KlipSync</h1>
        <p className="text-muted-foreground text-sm">
          Brug en af følgende metoder til at logge ind
        </p>
      </div>
      <AuthCard />
    </div>
  );
}
