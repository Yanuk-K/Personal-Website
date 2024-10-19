export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative flex w-full overflow-x-hidden border-b-2 border-t-2 border-border dark:border-darkBorder bg-white dark:bg-secondaryBlack text-text dark:text-darkText font-base">
      <div className="animate-marquee whitespace-nowrap py-3">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-xl">
              {item}
            </span>
          );
        })}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-3">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-xl">
              {item}
            </span>
          );
        })}
      </div>

      {/* must have both of these in order to work */}
    </div>
  );
}
