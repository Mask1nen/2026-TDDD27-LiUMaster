import { DashboardCard } from "./dashboardcard";

function Dashboard() {
  return (
    <div className="flex flex-row w-full gap-4">
      <DashboardCard
        destinationPage="/userplanviewer"
        name="My plans"
        description="Visa och skapa nya masterplaner"
      />
      <DashboardCard
        destinationPage="/explorer"
        name="Explorer"
        description="Utforska andra användares planer"
      />
    </div>
  );
}

export default Dashboard;
