import { notFound } from "next/navigation";
import { ALGORITHM_SEEDS, getAlgorithmById } from "@rubiks/core";
import { AlgorithmDetail } from "@/components/AlgorithmDetail";

export function generateStaticParams() {
  return ALGORITHM_SEEDS.map((a) => ({ algorithmId: a.id }));
}

export default function AlgorithmPage({
  params,
}: {
  params: { algorithmId: string };
}) {
  const algorithm = getAlgorithmById(params.algorithmId);
  if (!algorithm) notFound();
  return <AlgorithmDetail algorithm={algorithm} />;
}
