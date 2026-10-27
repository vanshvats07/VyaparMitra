import { redirect } from "next/navigation";
import { getCurrentProfile } from "../../../lib/profile-session";
import EditBusinessDetailsForm from "./edit-business-details-form";

export default async function EditBusinessDetailsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main
      className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
      lang={profile.preferredLanguage === "hi" ? "hi" : "en"}
    >
      <EditBusinessDetailsForm
        initialDetails={{
          businessStatus: profile.businessStatus,
          businessIdea: profile.businessIdea,
          businessCategory: profile.businessCategory,
          availableBudget: profile.availableBudget,
          experienceLevel: profile.experienceLevel,
        }}
        language={profile.preferredLanguage}
      />
    </main>
  );
}
