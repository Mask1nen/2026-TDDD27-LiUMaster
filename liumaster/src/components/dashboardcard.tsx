import { useNavigate } from "react-router-dom";

type DashboardcardProps = {
  destinationPage?: string;
  name: string;
  description: string;
  imageURL: string;
};

// Kort som används i dashboard för att visa skapade planer
export function DashboardCard({
  destinationPage,
  name,
  description,
  imageURL,
}: DashboardcardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${destinationPage}`);
  };

  return (
    <div
      onClick={handleClick}
      className="h-115 w-140 rounded-xl bg-surface-raised border-2 border-neutral-700 items-center justify-center hover:cursor-pointer hover:text-cyan-500 hover:scale-105 transform duration-200"
    >
      <img
        src={imageURL}
        className="rounded-t-xl border-b-2 border-neutral-700"
      ></img>
      <div className="flex flex-col p-2">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-xl text-content">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
