import { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "./components/BookCard";

function App() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        // Получение основного списка книг [cite: 14]
        axios.get('https://fakeapi.extendsclass.com/books')
            .then((response) => {
                setBooks(response.data);
            });
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap', // Перенос карточек на новую строку
            gap: '20px',
            padding: '20px',
            justifyContent: 'center'
        }}>
            {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
            ))}
        </div>
    );
}

export default App;