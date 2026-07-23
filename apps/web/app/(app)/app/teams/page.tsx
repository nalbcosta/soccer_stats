import { PageHeading } from "../../../../components/app/page-heading";
import { TeamCreateForm } from "../../../../components/teams/team-create-form";
import { TeamList } from "../../../../components/teams/team-list";
import { TeamDiscovery } from "../../../../components/teams/team-discovery";

export default function TeamsPage() {
  return (
    <>
      <PageHeading eyebrow="Elencos" title="Times da turma" />
      <div className="mb-5">
        <TeamCreateForm />
      </div>
      <TeamList />
      <section className="mt-8 border-t border-border pt-6"><TeamDiscovery /></section>
    </>
  );
}
