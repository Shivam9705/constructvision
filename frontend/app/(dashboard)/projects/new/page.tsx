import ProjectForm from "@/components/projects/ProjectForm";

export const metadata = { title: "New Project" };

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below. More information = more accurate AI estimate.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
