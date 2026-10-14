import { DashboardCard } from "../components/dashboardcard";
import matching from "../assets/matching.svg";
import planner from "../assets/planner.svg";
import explorer from "../assets/explorer.svg";

function Dashboard() {
  return (
    <div className="flex flex-col gap-15">
      <div className="flex flex-col text-center">
        <h1 className="text-content text-7xl text-center font-extrabold font-serif mt-10">
          FRÅN TANKE TILL MASTERPLAN
        </h1>
        <p className="font-serif font-semibold">Nu sätter vi igång!</p>
      </div>
      <div className="flex flex-1 flex-row gap-15 p-2 items-center justify-center">
        <DashboardCard
          destinationPage="/myplans"
          name="Mina planer"
          description="Visa och skapa nya masterplaner"
          imageURL={planner}
        />
        <DashboardCard
          destinationPage="/matcher"
          name="Matcharen"
          description="Matcha din primära plan med andra användare"
          imageURL={matching}
        />
        <DashboardCard
          destinationPage="/explorer"
          name="Utforskaren"
          description="Utforska andra användares planer"
          imageURL={explorer}
        />
      </div>
    </div>
  );
}

export default Dashboard;
