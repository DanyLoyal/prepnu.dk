import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="heading-font text-3xl font-semibold text-olive-950">Betaling annulleret</h1>
      <p className="mt-4 text-stone-700">Din kurv er stadig gemt, og du kan prøve igen.</p>
      <Link
        href="/kurv"
        className="mt-6 inline-flex rounded bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
      >
        Tilbage til kurv
      </Link>
    </div>
  );
}
