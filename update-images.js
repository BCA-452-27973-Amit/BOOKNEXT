const fs = require('fs');
const path = require('path');

// Update books.ts with image paths
const booksFile = './src/data/books.ts';
let booksContent = fs.readFileSync(booksFile, 'utf-8');

const imageMap = {
  '"1"': '/book-cover-pic/book1.jpg',
  '"2"': '/book-cover-pic/book2.jpg',
  '"3"': '/book-cover-pic/book3.png',
  '"4"': '/book-cover-pic/book4.jpg',
  '"5"': '/book-cover-pic/book6.jpg',
  '"6"': '/book-cover-pic/book7.jpg',
  '"7"': '/book-cover-pic/book8.jpg',
  '"8"': '/book-cover-pic/book9.jpg',
  '"9"': '/book-cover-pic/book11.jpg',
  '"10"': '/book-cover-pic/book12.jpg',
  '"11"': '/book-cover-pic/book13.png',
  '"12"': '/book-cover-pic/book1.jpg',
};

// Replace each book's empty image with actual path
Object.entries(imageMap).forEach(([bookId, imagePath]) => {
  const pattern = new RegExp(`(id: ${bookId},.*?image: ")("`,  'gs');
  booksContent = booksContent.replace(pattern, `$1${imagePath}$2`);
});

fs.writeFileSync(booksFile, booksContent, 'utf-8');
console.log('✅ Updated books.ts with image paths');

// Update BookCard.tsx to display images
const cardFile = './src/components/BookCard.tsx';
let cardContent = fs.readFileSync(cardFile, 'utf-8');

const oldImageSection = `      {/* Image / 3D Book */}
      <Link to={`/book/$\{book.id}`} className="block perspective-book">
        <div className="relative h-56 bg-muted flex items-center justify-center overflow-hidden">
          <div className="book-3d flex items-center justify-center">
            <div className="w-32 h-44 bg-gradient-saffron rounded-sm flex flex-col items-center justify-center p-3 shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-sm" />
              <BookOpen className="w-8 h-8 text-primary-foreground/80 mb-2" />
              <p className="text-primary-foreground text-xs font-display font-semibold text-center leading-tight line-clamp-2">
                {book.title}
              </p>
              <p className="text-primary-foreground/70 text-[9px] font-body mt-1">{book.author}</p>
              {/* Spine effect */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-foreground/10 rounded-l-sm" />
            </div>
          </div>
        </div>
      </Link>`;

const newImageSection = `      {/* Image / Book Cover */}
      <Link to={`/book/$\{book.id}`} className="block overflow-hidden">
        {book.image ? (
          <div className="relative h-56 w-full overflow-hidden bg-muted">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative h-56 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/50 mb-2" />
              <p className="text-sm font-display font-semibold text-center text-primary/50 px-2">{book.title}</p>
            </div>
          </div>
        )}
      </Link>`;

cardContent = cardContent.replace(oldImageSection, newImageSection);
fs.writeFileSync(cardFile, cardContent, 'utf-8');
console.log('✅ Updated BookCard.tsx to display real book images');
console.log('\n🎉 All updates completed! Refresh your browser to see the changes.');
