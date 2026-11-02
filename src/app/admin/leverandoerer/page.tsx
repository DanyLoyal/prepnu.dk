import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierRow } from "@/components/admin/supplier-row";
import { CreateSupplierForm } from "@/components/admin/create-supplier-form";

export const metadata: Metadata = { title: "Leverandører" };
export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Leverandører</h1>
        <p className="mt-1 text-sm text-stone-500">
          Status, seneste synkronisering og fejl-log pr. leverandør.
        </p>
      </div>

      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <SupplierRow key={supplier.id} supplier={supplier} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tilføj leverandør</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSupplierForm />
        </CardContent>
      </Card>
    </div>
  );
}
