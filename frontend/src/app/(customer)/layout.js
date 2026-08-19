import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CustomerCategoryBar from "@/components/CustomerCategoryBar/CustomerCategoryBar";
// import CategoryBar from "@/components/CategoryBar/CategoryBar";

export default function CustomerLayout({ children }) {
    return (
        <>
            <Navbar />

            <CustomerCategoryBar />

            {/* <CategoryBar /> */}

            {children}

            <Footer />
        </>
    );
}