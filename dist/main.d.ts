export interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}
export interface Book {
    title: string;
    author: string;
    year?: number;
    genre: "fiction" | "non-fiction";
}
export declare function createUser(id: number, name: string, email: string, isActive: boolean): User;
export declare function createBook(book: Book): Book;
export declare function calculateArea(shape: "circle", radius: number): number;
export declare function calculateArea(shape: "square", side: number): number;
type Status = "active" | "inactive" | "new";
export declare function getStatusColor(status: Status): "green" | "grey" | "yellow";
type StringFormatter = (string: string, uppercase: boolean) => string;
export declare const capitalizeFirstLetter: StringFormatter;
export declare const trimAndFormat: StringFormatter;
export declare function getFirstElement<T>(arr: T[]): T | undefined;
export interface HasId {
    id: number;
}
export declare function findById<T extends HasId>(items: T[], id: number): T | undefined;
export declare function csvToJSON(input: string[], delimiter: string): object[];
export {};
//# sourceMappingURL=main.d.ts.map