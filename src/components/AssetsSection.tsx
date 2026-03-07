import { Link } from "@/i18n/navigation";

export type AssetModel = {
  id: number;
  name: string;
  imageUrl: string;
};

type AssetsSectionProps = {
  title: string;
  models: AssetModel[];
};

export function AssetsSection({ title, models }: AssetsSectionProps) {
  return (
    <section className="assets">
      <h2 className="assets__title">{title}</h2>
      <div className="assets__grid">
        {models.map((model) => (
          <Link
            key={model.id}
            href={`/assets/${model.id}`}
            className="asset-card"
          >
            <span
              className="asset-card__image"
              style={{ backgroundImage: `url(${model.imageUrl})` }}
            />
            <span className="asset-card__name">{model.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
