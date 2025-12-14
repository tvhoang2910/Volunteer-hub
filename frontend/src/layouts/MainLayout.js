import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="pt-20 lg:pt-60">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
