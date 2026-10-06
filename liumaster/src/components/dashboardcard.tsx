import { useNavigate } from "react-router-dom";

type DashboardcardProps = {
  destinationPage?: string;
  name: string;
  description: string;
};

// Kort som används i dashboard för att visa skapade planer
export function DashboardCard({
  destinationPage,
  name,
  description,
}: DashboardcardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${destinationPage}`);
  };

  return (
    <div
      onClick={handleClick}
      className="h-60 w-100 p-4 rounded-xl border-2 border-neutral-700 bg-neutral-800 items-center justify-center hover:cursor-pointer hover:text-cyan-500"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-xl text-white">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
