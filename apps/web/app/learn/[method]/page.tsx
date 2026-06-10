import { notFound } from "next/navigation";
import { getAlgorithmsByMethod } from "@rubiks/core";
import { AlgorithmList } from "@/components/AlgorithmList";
import { METHOD_META, methodFromSlug } from "@/lib/catalog";

export function generateStaticParams() {
  return METHOD_META.map((m) => ({ method: m.slug }));
}

export default function MethodPage({
  params,
}: {
  params: { method: string };
}) {
  const meta = methodFromSlug(params.method);
  if (!meta) notFound();

  const algorithms = getAlgorithmsByMethod(meta.method);

  return (
    <div className="method-page">
      <header className="method-header">
        <h1>{meta.label}</h1>
        <p>{meta.blurb}</p>
      </header>
      <AlgorithmList algorithms={algorithms} />
    </div>
  );
}
