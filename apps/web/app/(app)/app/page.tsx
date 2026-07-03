import { PageHeading } from "../../../components/app/page-heading";
import { DashboardOverview } from "../../../components/dashboard/dashboard-overview";

export default function AppHomePage() {
  return (
    <>
      <PageHeading eyebrow="Vestiario" title="Resumo da rodada" />
      <DashboardOverview />
    </>
  );
}
