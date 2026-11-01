import { Metadata } from "next";
import { CustomerOrderView } from "@/components/order/CustomerOrderView";

interface Props {
  params: Promise<{
    tenant: string;
    branch: string;
    table: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params;
  return {
    title: `Pesan Menu - Ordexa`,
    description: `Pesan makanan dan minuman langsung dari meja via QR Code.`,
  };
}

export default async function CustomerOrderPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <CustomerOrderView
      tenant={resolvedParams.tenant}
      branch={resolvedParams.branch}
      table={resolvedParams.table}
    />
  );
}
