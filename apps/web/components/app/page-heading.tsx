export function PageHeading({
  title,
  eyebrow,
  action
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase text-field">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{title}</h1>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
