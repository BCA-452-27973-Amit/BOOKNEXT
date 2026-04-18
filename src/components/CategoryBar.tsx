import { Link } from "react-router-dom";
import { BookOpen, Lightbulb, History, FlaskConical, Feather, Briefcase, Baby, Brain, Bookmark, BookMarked } from "lucide-react";
import { categories } from "@/data/books";

const iconMap: Record<string, React.ReactNode> = {
  Fiction: <BookOpen className="w-5 h-5" />,
  "Non-Fiction": <Bookmark className="w-5 h-5" />,
  "Self-Help": <Lightbulb className="w-5 h-5" />,
  History: <History className="w-5 h-5" />,
  "Science & Technology": <FlaskConical className="w-5 h-5" />,
  Literature: <BookMarked className="w-5 h-5" />,
  Philosophy: <Brain className="w-5 h-5" />,
  Business: <Briefcase className="w-5 h-5" />,
  Poetry: <Feather className="w-5 h-5" />,
  Children: <Baby className="w-5 h-5" />,
};

const CategoryBar = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/books?category=${encodeURIComponent(cat)}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card card-shadow hover:elevated-shadow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-3 rounded-full bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {iconMap[cat] || <BookOpen className="w-5 h-5" />}
              </div>
              <span className="text-sm font-body font-medium text-foreground text-center">{cat}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;
