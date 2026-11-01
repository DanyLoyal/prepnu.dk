import { ClearCartOnSuccess } from "./clear-cart-on-success";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <ClearCartOnSuccess />
      <h1 className="heading-font text-3xl font-semibold text-olive-950">Tak for din bestilling!</h1>
      <p className="mt-4 text-stone-700">
        Vi har modtaget din betaling og sender en ordrebekræftelse til din e-mail.
      </p>
    </div>
  );
}
