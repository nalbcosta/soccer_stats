import { PageHeading } from "../../../../components/app/page-heading";
import { TeamCreateForm } from "../../../../components/teams/team-create-form";
import { TeamList } from "../../../../components/teams/team-list";

export default function TeamsPage() {
  return (
    <>
      <PageHeading eyebrow="Elencos" title="Times da turma" />
      <div className="mb-5">
        <TeamCreateForm />
      </div>
      <TeamList />
    </>
  );
}
