import ContentSection from "@/components/ContentSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/Hero";
import ModelSection from "@/components/Modelinfo";
import TryOutSection from "@/components/ModelTryout";

export default function Home() {
  return (
    <div className="main">
      <Header />
      <HeroSection />
      <ContentSection />
      <ModelSection />
      <TryOutSection />
      <Footer />
    </div>
  );
}
