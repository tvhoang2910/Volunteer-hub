import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
