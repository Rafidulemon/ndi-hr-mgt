import { type ReactNode } from "react";
import LeftMenu from "../navigations/LeftMenu";
import { FaRocketchat } from "react-icons/fa";

interface LayoutProps {
  children: ReactNode;
  roleType?: "employee" | "sub_leader" | "leader" | "admin";
}

function Layout(props: LayoutProps) {
  const {
    children,
    roleType = "employee",
  } = props;
  console.log(roleType)

  return (
    <div className="min-h-screen max-w-screen bg-[#ECECEC] flex flex-row gap-1 grid grid-cols-6 relative">
      <div className="col-span-1">
        <LeftMenu />
      </div>
      <div className="col-span-5 flex flex-col gap-0 p-10">
        {children}
      </div>

      <div className="fixed bottom-10 right-10">
        <button
          className="bg-primary p-4 rounded-full shadow-xl text-white shadow-lg hover:bg-white focus:outline-none hover:text-primary"
          onClick={() => alert('Chat clicked!')}
        >
          <FaRocketchat size={40} />
        </button>
      </div>
    </div>
  );
}

export default Layout;
