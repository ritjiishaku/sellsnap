import { DashboardOverview } from '@/app/dashboard/_components/DashboardOverview';
import { ProductsPanel } from '@/app/dashboard/_components/ProductsPanel';
import { OrdersPanel } from '@/app/dashboard/_components/OrdersPanel';
import { getDashboardStats, getProducts, getOrders } from '@/app/dashboard/actions';

export async function DashboardShell({ tab }: { tab: string }) {
  switch (tab) {
    case 'products': {
      const data = await getProducts();
      return <ProductsPanel initialData={data} />;
    }
    case 'orders': {
      const data = await getOrders('all');
      return <OrdersPanel initialData={data} />;
    }
    default: {
      const data = await getDashboardStats();
      return <DashboardOverview initialData={data} />;
    }
  }
}
