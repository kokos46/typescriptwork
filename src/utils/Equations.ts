


export function sum(numbers: number[]): number{
    return numbers.reduce((acc, val) => acc + val, 0);
}

export function average(numbers: number[]): number{
    return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
}
