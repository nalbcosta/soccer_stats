import { PageHeading } from "../../../../components/app/page-heading";
import { TournamentCreateForm } from "../../../../components/tournaments/tournament-create-form";
import { TournamentList } from "../../../../components/tournaments/tournament-list";

export default function TournamentsPage() {
  return (
    <>
      <PageHeading eyebrow="Copas" title="Campeonatos da resenha" />
      <section className="mb-5 rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 font-bold">Abrir nova copa</p>
        <TournamentCreateForm />
      </section>
      <TournamentList />
    </>
  );
}
