import Link from "next/link";
import { getAlgorithmsByMethod } from "@rubiks/core";
import { METHOD_META } from "@/lib/catalog";

export default function LearnPage() {
  return (
    <div className="learn">
      <h1>Choose a method</h1>
      <p className="lede">
        Follow the guided path from beginner to advanced, or jump straight to
        the set you&apos;re drilling.
      </p>
      <div className="methods">
        {METHOD_META.map((m) => (
          <Link key={m.slug} href={`/learn/${m.slug}`} className="method-card">
            <h2>{m.label}</h2>
            <p>{m.blurb}</p>
            <span className="count">
              {getAlgorithmsByMethod(m.method).length} algorithms
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
