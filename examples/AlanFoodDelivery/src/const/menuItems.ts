import categories from "./categories";

const menuItems = [
    {title: 'Pepperoni', img: 'pizza-pepperoni', price: 14, id: 'prn', type: categories.pizza, typeIcon: 'pizza',categoryImg:'pizza-pepperoni'},
    {title: 'Margarita', img: 'pizza-margarita', price: 10, id: 'mrg', type: categories.pizza, typeIcon: 'pizza',categoryImg:'pizza-pepperoni'},
    {title: 'Cheese', img: 'pizza-four-cheese', price: 10, id: '4ch', type: categories.pizza, typeIcon: 'pizza',categoryImg:'pizza-pepperoni'},
    {title: 'Hawaiian', img: 'pizza-hawaii', price: 10, id: 'haw', type: categories.pizza, typeIcon: 'pizza',categoryImg:'pizza-pepperoni'},

    {title: 'Burrito', img: 'street-food-burrito', price: 12, id: 'brt', type: categories.streetFood, typeIcon: 'restaurant',categoryImg:'street-food-burrito'},
    {title: 'Burger', img: 'street-food-burger', price: 23, id: 'brg', type: categories.streetFood, typeIcon: 'restaurant',categoryImg:'street-food-burrito'},
    {title: 'Taco', img: 'street-food-taco', price: 10, id: 'tco', type: categories.streetFood, typeIcon: 'restaurant',categoryImg:'street-food-burrito'},
    {title: 'Sandwich', img: 'street-food-sandwich', price: 10, id: 'snd', type: categories.streetFood, typeIcon: 'restaurant',categoryImg:'street-food-burrito'},

    {title: 'Apple Pie', img: 'dessert-apple-pie', price: 5, id: 'apl', type: categories.desserts, typeIcon: 'ice-cream',categoryImg:'dessert-apple-pie'},
    {title: 'Cheesecake', img: 'dessert-cheesecake', price: 15, id: 'chc', type: categories.desserts, typeIcon: 'ice-cream',categoryImg:'dessert-apple-pie'},

    {title: 'Coca-Cola', img: 'drinks-cola', price: 2, id: 'sod', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    {title: 'Americano', img: 'drinks-americano', price: 1, id: 'amr', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    {title: 'Latte', img: 'drinks-latte', price: 3, id: 'lat', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    {title: 'Cappuccino', img: 'drinks-cappuccino', price: 3, id: 'cap', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    {title: 'Orange Juice', img: 'drinks-orange-juice', price: 3, id: 'orj', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    {title: 'Tea', img: 'drinks-tea', price: 3, id: 'tea', type: categories.drinks, typeIcon: 'cafe',categoryImg:'drinks-latte'},
    ];

export default menuItems;