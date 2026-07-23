import { PublicHeader } from "../../components/public/public-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}
