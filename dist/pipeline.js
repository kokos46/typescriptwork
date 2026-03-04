function query(...steps) {
    return (initialData) => {
        let data = initialData;
        for (const step of steps) {
            data = step(data);
        }
        return data;
    };
}
const users = [
    { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
    { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
    { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];
const where = (key, value) => (data) => data.filter((item) => item[key] === value);
const sort = (key) => (data) => [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv)
        return -1;
    if (av > bv)
        return 1;
    return 0;
});
const search = query(where("name", "John"), where("surname", "Doe"), sort("age"));
const result = search(users);
export {};
//# sourceMappingURL=pipeline.js.map