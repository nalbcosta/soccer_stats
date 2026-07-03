import clsx from "clsx";

export function TeamCrest({
  name,
  className
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={clsx(
        "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-field text-sm font-black text-white shadow-line",
        className
      )}
    >
      {initials || "NB"}
    </span>
  );
}
