import Link from "next/link";
import { getAlgorithmsByMethod } from "@rubiks/core";
import { METHOD_META } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Master Rubik&apos;s cube algorithms in 3D.</h1>
        <p>
          Watch every algorithm as an animated 3D cube. Step through each turn,
          replay the tricky bits, and track your progress from learning to
          mastered — no login required.
        </p>
        <Link href="/learn" className="cta">
          Start learning →
        </Link>
      </section>

      <section className="methods">
        {METHOD_META.map((m) => {
          const count = getAlgorithmsByMethod(m.method).length;
          return (
            <Link key={m.slug} href={`/learn/${m.slug}`} className="method-card">
              <h2>{m.label}</h2>
              <p>{m.blurb}</p>
              <span className="count">{count} algorithms</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
