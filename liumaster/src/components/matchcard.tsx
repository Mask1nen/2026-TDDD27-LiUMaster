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
      className={`group h-60 p-4 rounded-xl border-2 border-themedBorder bg-surface-raised text-content items-center justify-center hover:cursor-pointer`}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex gap-2 justify-between">
          <div>
            <h3 className="group-hover:text-cyan-500 text-3xl font-bold">
              {match.plan.name}
            </h3>
            <p>{specName}</p>
            <p>{match.plan.authorName}</p>
          </div>
          <div className="text-right">
            <p>{match.plan.program}</p>
          </div>
        </div>
        <div className="flex justify-between items-baseline">
          <Link
            to={`/conversations/${match.plan.authorID}`}
            onClick={(e) => e.stopPropagation()}
            className="border-2 border-blue-500 bg-blue-700 p-1 text-white hover:bg-blue-600"
          >
            Skicka ett meddelande
          </Link>
          <p>{Math.round(match.score * 100)}% match</p>
        </div>
      </div>
    </div>
  );
}

export default { MatchCard };
