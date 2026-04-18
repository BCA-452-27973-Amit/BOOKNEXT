import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryBar from "@/components/CategoryBar";
import FeaturedBooks from "@/components/FeaturedBooks";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Hero />
      <CategoryBar />
      <FeaturedBooks />
    </main>
    <Footer />
  </div>
);

export default Index;
