const allCats = [
    { id: 1, name: 'cat 1' },
    { id: 2, name: 'cat 2' },
    { id: 3, name: 'cat 3' },
    { id: 4, name: 'cat 4' },
    { id: 5, name: 'cat 5' },
];
const cats = [
    { id: 2, name: 'cat 2' },
    { id: 5, name: 'cat 5' },
];

let products = [
    {
        id: 1,
        title: 'product',
        price: 300,
        categories: [
            { id: 1, name: 'cat 1' },
            { id: 3, name: 'cat 3' },
        ],
    },
    {
        id: 2,
        title: 'product',
        price: 400,
        categories: [
            { id: 1, name: 'cat 1' },
            { id: 2, name: 'cat 2' },
        ],
    },
    {
        id: 3,
        title: 'product',
        price: 500,
        categories: [
            { id: 2, name: 'cat 2' },
            { id: 3, name: 'cat 3' },
        ],
    },
    {
        id: 4,
        title: 'product',
        price: 600,
        categories: [
            { id: 2, name: 'cat 2' },
            { id: 5, name: 'cat 5' },
        ],
    },
    {
        id: 5,
        title: 'product',
        price: 700,
        categories: [
            { id: 4, name: 'cat 4' },
            { id: 3, name: 'cat 3' },
        ],
    },
];

const price = { min: 300, max: 500 };
products = products.filter(product => {
    return price.min <= product.price && product.price <= price.max;
});

console.log(products);
console.log(products.length);
