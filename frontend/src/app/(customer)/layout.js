import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CustomerCategoryBar from "@/components/CustomerCategoryBar/CustomerCategoryBar";
// import ChatBot from "@/components/ChatBot/ChatBot";
// import CategoryBar from "@/components/CategoryBar/CategoryBar";

export default function CustomerLayout({ children }) {
    return (
        
        <div className="min-h-screen flex flex-col">

            <Navbar />

            <CustomerCategoryBar />

            {/* <CategoryBar /> */}

            <main className="flex-1">
                {children}
            </main>
            

            <Footer />

            {/* <ChatBot /> */}
        </div>
        
    );
}