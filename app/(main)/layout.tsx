import Navbar from "@/components/global/Navbar";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { DeepgramContextProvider } from "../context/DeepgramContextProvider";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="p-10 mt-20 md:px-20 lg:px-32 xl:px-56 2xl:72">
        <MicrophoneContextProvider>
          <DeepgramContextProvider>{children}</DeepgramContextProvider>
        </MicrophoneContextProvider>
      </div>
    </div>
  );
}

export default DashboardLayout;
