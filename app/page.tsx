import SideBar from "@/components/global/sideBar";
import { AuthProvider } from "@/contexts/AuthContext";

const page = () => {
  return (
    <div className="overflow-x-auto ">
      <AuthProvider>
        <SideBar />
      </AuthProvider>
    </div>
  );
};

export default page;
