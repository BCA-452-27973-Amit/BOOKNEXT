import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-warm">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-body font-medium">
              <Sparkles className="w-4 h-4" />
              India's Favourite Bookstore
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Discover Your Next{" "}
              <span className="text-gradient-saffron">Great Read</span>
            </h1>
            <p className="text-lg font-body text-muted-foreground max-w-lg">
              From timeless Indian classics to global bestsellers — explore thousands of books at prices that make reading affordable for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/books"
                className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 elevated-shadow"
              >
                Browse Books <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/books?category=Fiction"
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95"
              >
                Top Fiction
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm font-body text-muted-foreground">
              <span className="flex items-center gap-1"><span className="text-foreground font-semibold">10,000+</span> Books</span>
              <span className="flex items-center gap-1"><span className="text-foreground font-semibold">Free</span> Delivery*</span>
              <span className="flex items-center gap-1"><span className="text-foreground font-semibold">COD</span> Available</span>
            </div>
          </motion.div>

          {/* Floating Books */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-72 h-80">
              {/* Back book */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-4 w-40 h-56 bg-secondary rounded-lg shadow-xl transform rotate-[-8deg]"
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-foreground/10 rounded-l-lg" />
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <BookOpen className="w-10 h-10 text-secondary-foreground/40 mb-2" />
                  <p className="text-secondary-foreground/60 text-xs font-display text-center">Wings of Fire</p>
                </div>
              </motion.div>
              {/* Front book */}
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-4 w-44 h-60 bg-gradient-saffron rounded-lg shadow-2xl transform rotate-[5deg] z-10"
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-foreground/10 rounded-l-lg" />
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <BookOpen className="w-12 h-12 text-primary-foreground/60 mb-3" />
                  <p className="text-primary-foreground text-sm font-display font-semibold text-center">The God of Small Things</p>
                  <p className="text-primary-foreground/70 text-xs font-body mt-1">Arundhati Roy</p>
                </div>
              </motion.div>
              {/* Small accent book */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-16 w-28 h-40 bg-gold/90 rounded-lg shadow-lg transform rotate-[12deg]"
              >
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-foreground/10 rounded-l-lg" />
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <BookOpen className="w-6 h-6 text-accent-foreground/50 mb-1" />
                  <p className="text-accent-foreground/80 text-[10px] font-display text-center">Ikigai</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
