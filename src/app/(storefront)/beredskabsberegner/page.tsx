import type { Metadata } from "next";
import { CalculatorForm } from "./calculator-form";

export const metadata: Metadata = {
  title: "Beredskabsberegner",
  description:
    "Beregn hvor meget vand, mad, varme, lys og førstehjælp din husstand har brug for i en nødsituation — og læg det hele i kurven med et klik.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="heading-font text-sm uppercase tracking-widest text-orange-600">Beredskabsberegner</p>
      <h1 className="heading-font mt-2 text-3xl font-semibold text-olive-950 sm:text-4xl">
        Hvor meget beredskab har din husstand brug for?
      </h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Angiv antal voksne, børn og hvor mange dage du vil være forberedt på. Vi beregner en
        anbefalet pakkeliste med vand, nødmad, varme, lys og førstehjælp — baseret på
        Sikkerhedsstyrelsens anbefalinger og tilpasset hvad vi faktisk har på lager.
      </p>

      <div className="mt-10">
        <CalculatorForm />
      </div>
    </div>
  );
}
