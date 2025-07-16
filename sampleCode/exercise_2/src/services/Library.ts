import { Book } from "../models/Book";

export class Library {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  removeBookById(id: number): void {
    this.books = this.books.filter((book) => book.id !== id);
  }

  findBooksByTitleOrAuthor(keyword: string): Book[] {
    return this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(keyword.toLowerCase()) ||
        book.author.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  getAllBooks(): Book[] {
    return this.books.sort(
      (a, b) => b.publishedDate.getTime() - a.publishedDate.getTime()
    );
  }
}
