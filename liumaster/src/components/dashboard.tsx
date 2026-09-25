import { DashboardCard } from "./dashboardcard";

function Dashboard() {
  return (
    <div className="flex flex-row size-full gap-2 p-2 bg-neutral-900">
      <DashboardCard
        destinationPage="/userplanviewer"
        name="Mina planer"
        description="Visa och skapa nya masterplaner"
      />
      <DashboardCard
        destinationPage="/explorer"
        name="Utforskaren"
        description="Utforska andra användares planer"
      />
    </div>
  );
}

export default Dashboard;
