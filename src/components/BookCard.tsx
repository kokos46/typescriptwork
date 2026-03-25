import { useEffect, useState } from "react";
import axios from "axios";

// @ts-ignore
export default function BookCard({ book }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            if (!book.isbn) return;

            try {
                const metaRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`);
                const thumbnailUrl = metaRes.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

                if (thumbnailUrl) {
                    const imageRes = await axios.get(thumbnailUrl, { responseType: 'blob' });

                    const blobUrl = URL.createObjectURL(imageRes.data);
                    setImageSrc(blobUrl);
                }
            } catch (err) {
                console.error("Ошибка загрузки изображения", err);
            }
        };

        fetchImage();
    }, [book.isbn]);

    return (
        <div className="book-card" style={{ width: '200px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '250px', backgroundColor: '#f0f0f0' }}>
                {imageSrc ? <img src={imageSrc} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : "Загрузка..."}
            </div>

            <h3 style={{ fontSize: '18px', margin: '10px 0 5px' }}>{book.title}</h3>

            {/* Авторы снизу  */}
            <div style={{ fontSize: '14px', color: '#555' }}>
                {book.authors?.map((author: string, index: number) => (
                    <div key={index}>{author}</div>
                ))}
            </div>
        </div>
    );
}