import UserNavbar from "@/components/user/navbar";


const UserLayout = ({ children }) => {
    return (
        <div className="flex flex-row min-h-screen relative">
            <div>
                <UserNavbar />
            </div>
            <div className="flex-1 transition-all duration-300">
                {children}
            </div>
        </div>
    );
};

export default UserLayout;
