import { BounceLoader } from "react-spinners";

export default function Spinner() {
  return (
    <div className="spinner_overlay">
      <BounceLoader size={60} color="#FFB703" />
    </div>
  );
}
