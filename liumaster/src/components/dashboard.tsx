import { Link } from "react-router-dom";

type DashBoardCardProps = {
  destinationPage: string;
  contentText: string;
  planID: string;
};

// Kort som används i dashboard för att till exempel skapa nya masterplaner.
function DashBoardCard({
  destinationPage,
  contentText,
  planID,
}: DashBoardCardProps) {
  return (
    <Link
      to={`${destinationPage}/${planID}`}
      className="flex h-60 items-center justify-center hover:bg-blue-500/50 bg-[#98E5EB] hover:cursor-pointer size-full border-2 border-neutral-600 shadow-sm shadow-black"
    >
      {contentText}
    </Link>
  );
}

// Dashboard för hemsidan, här ska visas bland annat skapade masterplaner, möjlighet att skapa nya masterplaner, kanske ett feed från vänners aktivitet, nyheter osv.
function Dashboard() {
  return (
    <div className="flex items-center flex-col size-full gap-2">
      <div id="center" className="grid grid-cols-4 h-full w-full gap-2">
        <DashBoardCard
          destinationPage="/planner"
          contentText="namn på plan"
          planID="1"
        ></DashBoardCard>
        <DashBoardCard
          destinationPage="/planner"
          contentText="+"
          planID="0"
        ></DashBoardCard>
      </div>
    </div>
  );
}

export default Dashboard;
