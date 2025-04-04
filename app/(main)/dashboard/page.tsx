import FeatureAssistants from "@/components/dashboard/FeatureAssistants";
import Feedback from "@/components/dashboard/Feedback";
import History from "@/components/dashboard/History";

function Dashboard() {
  return (
    <div>
      <FeatureAssistants />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        <History />
        <Feedback />
      </div>
    </div>
  );
}

export default Dashboard;
