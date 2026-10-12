import { Link, useNavigate } from "react-router-dom";
import { MASTERINRIKTNINGAR, type PlanMatch } from "../types";

type MatchCardProps = {
  destinationPage?: string;
  match: PlanMatch;
};

export function MatchCard({ match, destinationPage }: MatchCardProps) {
  const navigate = useNavigate();
  const programSpecs = MASTERINRIKTNINGAR[match.plan.program];
  const foundSpec = programSpecs.find(
    (s) => s.code == match.plan.specialization,
  );
  const specName = foundSpec?.name;

  const handleClick = () => {
    navigate(`${destinationPage}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`h-60 p-4 rounded-xl border-2 border-neutral-700 bg-surface-raised text-content items-center justify-center hover:cursor-pointer hover:text-cyan-500`}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="text-3xl font-bold">{match.plan.name}</h1>
            <h1 className="text-content">{specName}</h1>
            <h1 className="text-content">{match.plan.authorName}</h1>
          </div>
          <div className="text-right">
            <h1 className="text-content">{match.plan.program}</h1>
          </div>
        </div>
        <div className="flex justify-between items-baseline">
          <Link
            to={`/conversations/${match.plan.authorID}`}
            onClick={(e) => e.stopPropagation()}
            className="border-2 border-neutral-700 bg-blue-700 p-1 text-white hover:bg-blue-600"
          >
            Skicka ett meddelande
          </Link>
          <h1 className="text-content">
            {Math.round(match.score * 100)}% match
          </h1>
        </div>
      </div>
    </div>
  );
}

export default { MatchCard };
