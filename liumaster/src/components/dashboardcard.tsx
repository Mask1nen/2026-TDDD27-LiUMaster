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
      className="h-60 border-2 rounded-md border-gray-800 bg-blue-950 items-center justify-center hover:cursor-pointer hover:shadow-[0px_6px_12px_6px_rgba(0,0,0,0.45)] transition-shadow p-4"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-white text-3xl">{name}</h1>
            <p className="text-white text-xl">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
