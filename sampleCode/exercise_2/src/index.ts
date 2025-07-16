import { Library } from "./services/Library";
import { Book } from "./models/Book";
import { Genre } from "./models/Genre";
import { cacheData } from "./utils/cache";

const library = new Library();

const book1: Book = {
  id: 1,
  title: "Clean Code",
  author: "Robert C. Martin",
  genre: Genre.NonFiction,
  publishedDate: new Date("2008-08-01"),
};

const book2: Book = {
  id: 2,
  title: "The Hobbit",
  author: "J.R.R. Tolkien",
  genre: Genre.Fantasy,
  publishedDate: new Date("1937-09-21"),
};

const book3: Book = {
  id: 3,
  title: "Harry Potter And The Chamber Of Secrets",
  author: "J.K. Rowling",
  genre: Genre.Fantasy,
  publishedDate: new Date("2000-09-01"),
};

const book4: Book = {
  id: 4,
  title: "JFK: Public, Private, Secret",
  author: "J. Randy Taraborrelli",
  genre: Genre.History,
  publishedDate: new Date("2025-07-15"),
};

library.addBook(book1);
library.addBook(book2);
library.addBook(book3);
library.addBook(book4);

console.log("All Books:");
console.log(library.getAllBooks());

console.log("\nSearch 'The Chamber':");
console.log(library.findBooksByTitleOrAuthor("The Chamber"));

library.removeBookById(1);

console.log("\nAfter deleting book with ID 1:");
console.log(library.getAllBooks());

cacheData<Book[]>(library.getAllBooks());
