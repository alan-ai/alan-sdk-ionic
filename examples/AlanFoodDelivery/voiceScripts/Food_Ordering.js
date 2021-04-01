// {Name: Food_Ordering}
// {Description: Food Ordering demo app for delivering food}

/*
This is a script for Food Ordering demo app for delivering food
Now there are four categories for food: drinks, pizza, street food, desserts.
*/

const menu = {
    "drink": [
        {id: "sod", title: "Cola", price: 2, type: "drink", alt: ["Coca-cola", "Soda", "Coca cola"]},
        {id: "amr", title: "Americano", price: 1, type: "drink"},
        {id: "lat", title: "Latte", price: 3, type: "drink"},
        {id: "cap", title: "Cappuccino", price: 3, type: "drink"},
        {id: "orj", title: "Orange juice", price: 3, type: "drink"},
        {id: "tea", title: "Tea", price: 3, type: "drink"}
    ],
    "pizza": [
        {id: "prn", title: "Pepperoni", price: 14, type: "pizza", alt: ["Pepperoni pizza"]},
        {id: "mrg", title: "Margarita", price: 10, type: "pizza", alt: ["Margarita pizza"]},
        {id: "4ch", title: "Cheese", price: 10, type: "pizza", alt: ["Cheese pizza"]},
        {id: "haw", title: "Hawaiian", price: 10, type: "pizza", alt: ["Hawaiian pizza"]}
    ],
    "street food": [
        {id: "brt", title: "Burrito", price: 12, type: "street food"},
        {id: "brg", title: "Burger", price: 23, type: "street food"},
        {id: "tco", title: "Taco", price: 10, type: "street food"},
        {id: "snd", title: "Sandwich", price: 10, type: "street food"}
    ],
    "dessert": [
        {id: "apl", title: "Apple pie", price: 5, type: "dessert"},
        {id: "chc", title: "Cheesecake", price: 15, type: "dessert"}
    ]
};

const dishes = [
    "Spaghetti",
    "Bruschetta",
    "Chicken Parmigiana",
    "Panini",
    "Panna Cotta",
    "Tramezzino",
    "Tiramisu",
    "Tortellini",
    "Lasagna",
    "Buffalo Chicken Wings",
    "Tater Tots",
    "Hot Dogs",
    "Barbecue Ribs",
    "Biscuits and Gravy",
    "Meatloaf",
    "Grits",
    "Hamburger",
];


const CATEGORY_ALIASES = _.reduce(Object.keys(menu), (a, p) => {
    const key = p.toLowerCase();
    a[key] = a[key + "s"] = a[key + "es"] = key;
    return a;
}, {});

const ID_TO_TYPES = _.reduce(menu, (a, p) => {
    p.forEach(i => a[i.id] = i.type);
    return a;
}, {});

const ITEM_ALIASES = _.reduce(menu, (a, p) => {
    p.forEach(i => {
        let key = i.title.toLowerCase();
        a[key] = a[key + "s"] = a[key + "es"] = i;
        if (i.alt) {
            i.alt.forEach(s => a[s.toLowerCase()] = a[s.toLowerCase() + "s"] = a[s.toLowerCase() + "es"] = i)
        }
    });
    return a;
}, {});

const ITEMS_INTENT = Object.keys(ITEM_ALIASES).join("|");
const DISHES_INTENT = dishes.join('|');
const CATEGORY_LIST = Object.keys(CATEGORY_ALIASES).join("|");

intent(`(back|go back)`, p => {
    let route = p.visual.route ? p.visual.route.toLowerCase() : null;
    switch (route) {
        case "/finish-order":
        case "/cleared-order":
            p.play({command: 'navigation', route: '/menu'});
            break;
        default:
            p.play({command: 'navigation', action: 'back'});
    }
    p.play(`OK`);
});

intent(`what is (it|the app|application)`, `where am I`,
    reply("(This is|It's) (just|simple) Food Ordering example application for (food delivery service|pizza ordering)"));

intent("What (kind|types) of food do you have (to order|)", "What do you have (to order|)", "What (food|) is available", "What can I (order|have|get)",
    reply("We have several pizzas, street foods, desserts, and drinks available. (What would you like to order?|)",
        "We offer pizzas, street foods, desserts, and drinks. (What would you like to order?|)"));

intent(`what (can|should|must) I (do|say|pronounce)`, `help (me|)`, `what to do (here|)`, `how to start`,
    p => {
        let route = p.visual.route ? p.visual.route.toLowerCase() : null;
        switch (route) {
            case "/menu/pizza":
            case "/menu/street food":
            case "/menu/dessert":
            case "/menu/drink":
                p.play("Here you can navigate through the menu and add and remove food to your order. To open menu category say (Open|go to) (drinks|pizza|street food|desserts). " +
                    "To add an item to your cart say 'add taco or add (2|3) (burgers|margaritas|latte)'. " +
                    "To remove an item from your cart say 'remove taco or remove (2|3) (burgers|margritas)'. " +
                    "To finish order and checkout say that is all or checkout");
                break;
            case "/cart":
                p.play("You are in your cart. You should answer questions about delivery address and time. " +
                    "You can change the address by saying 'set address' and you can change delivery time when you say 'set time'");
                break;
            //TODO: Not returned in VS route
            case "time":
                p.play("Enter or say what time we should deliver an order to you");
                break;
            //TODO: Not returned in VS route
            case "address":
                p.play("Here you can point the address for delivering your order", "Please, enter or say what is the delivery address?");
                break;
            case "/finish-order":
                p.play("You finished your order, if you want to make another order say 'go back' or 'open menu' and add new items to your order");
                break;
            case "/cleared-order":
                p.play("You have (cleared|canceled) your order, if you want to make another order say 'go back' or 'open menu' and add new items to your order");
                break;

            default:
                p.play("We have several pizzas, street foods, desserts, and drinks available.", "We offer pizzas, street foods, desserts, and drinks. What would you like to order?");
        }
    });

let getProduct = context(() => {
    follow(`(add|I want|order|get me|and|) $(ITEM ${ITEMS_INTENT})`, p => {
        return p.resolve(p.ITEM.value);
    })
});

intent(`What $(CAT ${CATEGORY_LIST}) do you have?`, `(Order|get me|add|) $(NUMBER) $(CAT ${CATEGORY_LIST})`, async p => {
    let key = CATEGORY_ALIASES[p.CAT.value.toLowerCase()];
    p.play({command: 'navigation', route: `/menu/${key}`});
    let value = p.CAT.endsWith('s') ? p.CAT.value : p.CAT.value + "s";
    p.play(`We have (a few|several) ${value} available`,
        `You can choose from a few different ${value}`,
        `There are a few types of ${value} (we have|available)`);
    for (let i = 0; i < menu[key].length; i++) {
        p.play({command: 'highlight', id: menu[key][i].id});
        p.play((i === menu[key].length - 1 ? "and " : "") + menu[key][i].title);
    }
    p.play(`Which ${value} would you like?`);
    p.play({command: 'highlight', id: ''});
    if (p.NUMBER) {
        let product = await p.then(getProduct);
        p.play(product);
        let items = [{value: product}];
        addItems(p, items, 0);
    }
});

intent(`how to (make an|) order`, `Give me an (order|) example`,
    reply("Choose food category and add items from menu to order. For example, you can say:" +
        "(select pizza, add 3 pepperoni, checkout|open street food, add 5 burgers, if you wish to remove some items say remove one burger, what is my order? checkout|open drinks, add one latte, add one cappuccino, that is all)"));

intent(`(open|what do you have in|choose|select|) $(ITEM ${CATEGORY_LIST})`, p => {
    p.play({command: 'navigation', route: `/menu/${CATEGORY_ALIASES[p.ITEM.toLowerCase()]}`});
    p.play(`Openning ${p.ITEM} menu`);
});

intent(`open cart`, p => {
    p.play({command: 'navigation', route: '/cart'});
    p.play(`Here is your cart`);
});

intent(`open menu`, p => {
    p.play({command: 'navigation', route: '/menu'});
    p.play(`Look at our menu`);
});

intent(`scroll down`, p => {
    p.play({command: 'scroll', direction: 'down'});
});

intent(`scroll up`, p => {
    p.play({command: 'scroll', direction: 'up'});
});

intent(`(clear|remove|empty|cancel) order`, p => {
    p.play({command: 'clearOrder', route: 'cleared-order'});
    p.play(`Your order has been canceled`);
});

let confirm = context(() => {
    follow('(yes|ok|correct|procede|confirm|continue|next|go on)', p => {
        p.play(`(Great,|) your order has been confirmed. and will be delivered`);
        if (p.visual.address) {
            p.play({command: 'highlight', id: 'address'});
            p.play(`to ${p.visual.address}`);
        }
        if (p.visual.date) {
            p.play({command: 'highlight', id: 'date'});
            p.play(`on ${p.visual.date}`);
        }
        if (p.visual.address) {
            p.play({command: 'highlight', id: 'time'});
            p.play(`at ${p.visual.time}`);
        }
        p.play({command: "finishOrder"});
        p.resolve(null);
    });

    follow('(no|change|invalid|nope|not correct|stop|back)', '(need|can you|please) (fix|change|update) (delivery|) (address|time|date)', p => {
        p.play({command: 'navigation', route: '/cart'});
        p.play("OK, please (make neccessary corrections|update an order|fix what you want)");
        p.resolve(null);
    });
})

let playDelivery = function (p, address, date, time) {
    if (!address) {
        p.play(`What is delivery address?`);
    } else if (!time) {
        p.play({command: 'highlight', id: 'time'});
        p.play(`What is delivery time?`);
    } else if (!date) {
        p.play({command: 'highlight', id: 'date'});
        p.play(`What is delivery date?`);
    } else {
        p.play({command: 'navigation', route: '/cart'});
        p.play(`OK, your order will be delivered to ${address}. Do you want to confirm your order?`);
        p.then(confirm, {address, date, time});
        return false;
    }
    return true;
}

// request delivery time
let checkout = context(() => {
    follow('$(LOC)', p => {
        p.play({command: "address", address: p.LOC.value});
        p.play({command: `highlight`, id: `address`});

        let date = api.moment().tz(p.timeZone).format("MMMM Do");
        let time = api.moment().tz(p.timeZone).add(30, 'minutes').format("h:mm a");
        p.play({command: "time", time: time, date: date});
        playDelivery(p, p.LOC.value, date, time);
    });

    follow('$(TIME)', '$(T now|asap|right now|as soon as possible)', '$(DATE)',
        '$(TIME) $(DATE)', '$(DATE) $(TIME)', p => {
            let time, date;
            if (p.T) {
                // deliver in 30 minutes
                date = api.moment().tz(p.timeZone).format("MMMM Do");
                time = api.moment().tz(p.timeZone).add(30, 'minutes').format("h:mm a");
                p.play({command: 'highlight', id: 'date'});
            }
            if (p.TIME) {
                time = p.TIME;
                date = date ? date : p.visual.date;
                p.play({command: 'highlight', id: 'time'});
            }
            if (p.DATE) {
                date = p.DATE.moment.format("MMMM Do");
                time = time ? time : p.visual.time;
                p.play({command: 'highlight', id: 'date'});
            }
            p.play({command: "time", time: time, date: date});

            playDelivery(p, p.visual.address, date, time);
        });

    follow("back (to order|)", p => {
        p.play({command: 'navigation', route: '/cart'});
        p.play(`OK`);
        p.resolve(null)
    });
});


let date = context(() => {
    follow('$(TIME)', '$(T now|asap|right now|as soon as possible)', '$(DATE)',
        '$(TIME) $(DATE)', '$(DATE) $(TIME)', p => {
            let time, date;
            if (p.T) {
                // deliver in 30 minutes
                date = api.moment().tz(p.timeZone).format("MMMM Do");
                time = api.moment().tz(p.timeZone).add(30, 'minutes').format("h:mm a");
                p.play({command: 'highlight', id: 'date'});
            }
            if (p.TIME) {
                time = p.TIME.value;
                date = date ? date : p.visual.date;
                p.play({command: 'highlight', id: 'time'});
            }
            if (p.DATE) {
                date = p.DATE.moment.format("MMMM Do");
                time = time ? time : p.visual.time;
                p.play({command: 'highlight', id: 'date'});
            }
            p.play({command: "time", time: time, date: date});

            playDelivery(p, p.visual.address, date, time);
        });
});

intent(`(add|I want|do you have|order) $(F ${DISHES_INTENT})`, p => {
    p.play(`Unfortunately you can't add  ${p.F} to your order. But we can offer it in our restaurant`);
});

// add items to order
intent(`(add|I want|order|get|and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(ITEM ${ITEMS_INTENT}) (and|)  $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|)  $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(ITEM ${ITEMS_INTENT}) (and|)  $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|and|) $(ITEM ${ITEMS_INTENT})`,
    p => addItems(p, p.ITEMs, 0));


intent(`(add|I want|order|get me|) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    p => addItems(p, p.ITEMs, 1));

intent(`(add|I want|order|get me|) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    p => addItems(p, p.ITEMs, 2));

intent(`(add|I want|order|get me|) $(NUMBER) $(ITEM ${ITEMS_INTENT}) (and|) $(ITEM ${ITEMS_INTENT}) (and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    p => addItems(p, p.ITEMs, 0, [0, -1, 1]));

function addItems(p, items, shift, pos = []) {
    let answer = "";
    let id, name;
    for (let i = 0; i < items.length; i++) {
        id = ITEM_ALIASES[items[i].value.toLowerCase()].id;
        name = items[i].value.toLowerCase();
        if (!id) {
            if (!_.isEmpty(answer)) {
                p.play(answer);
            }
            p.play(`Can't find ${items[i].value} in menu`);
            return;
        } else {
            let number = p.NUMBERs && p.NUMBERs[i - shift] ? p.NUMBERs[i - shift].number : 1;
            if (!_.isEmpty(pos)) {
                number = i < pos.length && pos[i] > -1 ? p.NUMBERs[pos[i]] : 1;
            }
            if (number > 99) {
                p.play(`Sorry, quantity of ${items[i].value} is too high.`);
                return;
            }
            p.play({command: 'addToCart', item: id, quantity: number});
            answer += i > 0 ? ` and ` : `Added `;
            answer += `${number} ${items[i].value} `;
            if (ID_TO_TYPES[id] === "pizza" && !name.includes("pizza")) {
                answer += number > 1 ? "pizzas " : "pizza ";
            }
        }
    }
    answer += "to your order";
    p.state.lastId = id;
    p.state.lastName = name;
    p.play({command: 'navigation', route: '/cart'});
    p.play(answer);
}

// replace items
intent(`change (one of |) the $(ITEM ${ITEMS_INTENT}) to a $(ITEM ${ITEMS_INTENT})`,
    p => {
        if (p.ITEMs && p.ITEMs.length !== 2) {
            p.play("Sorry, you should provide exactly two items in this request");
            return;
        }
        let delId = ITEM_ALIASES[p.ITEMs[0].value.toLowerCase()].id;
        if (!delId) {
            p.play(`Can't find ${p.ITEMs[0]} in menu`);
        } else {
            let addId = ITEM_ALIASES[p.ITEMs[1].value.toLowerCase()].id;
            let delName = p.ITEMs[0].value.toLowerCase();
            let addName = p.ITEMs[1].value.toLowerCase();
            if (!addId) {
                p.play(`Can't find ${p.ITEMs[1]} in menu`);
            } else {
                p.state.lastId = addId;
                p.state.lastName = addName;
                let delNumber = p.NUMBERs && p.NUMBERs[0] ? p.NUMBERs[0].number : 1;
                let number_add = p.NUMBERs && p.NUMBERs[1] ? p.NUMBERs[1].number : 1;
                let postfix_add = "";
                let postfix_del = "";
                if (ID_TO_TYPES[addId] === "pizza" && !addName.includes("pizza")) {
                    postfix_add = number_add > 1 ? "pizzas" : "pizza";
                }
                if (ID_TO_TYPES[delId] === "pizza" && !delName.includes("pizza")) {
                    postfix_del = delNumber > 1 ? "pizzas" : "pizza";
                }
                let ans = '';
                let order = p.visual.order || {};
                if (!order[delId]) {
                    ans = `${p.ITEMs[0]} has not been ordered yet, `;
                } else {
                    p.play({command: 'removeFromCart', item: delId, quantity: delNumber});
                    ans = `Removed ${delNumber} ${p.ITEMs[0]} ${postfix_del} and `;
                }
                p.play({command: 'addToCart', item: addId, quantity: number_add});
                p.play(ans + ` added ${number_add} ${p.ITEMs[1]} ${postfix_add}`);
            }
        }
        p.play({command: 'navigation', route: '/cart'});
    });

intent(`add (another|) $(NUMBER) more`, `add another`, p => {
    if (p.state.lastId) {
        let number = p.NUMBER && p.NUMBER.number > 0 ? p.NUMBER.number : 1;
        if (number > 99) {
            p.play(`Sorry, number is too high.`);
            return;
        }
        p.play({command: 'addToCart', item: p.state.lastId, quantity: number});
        p.play(`Added another ${number} ${p.state.lastName}`);
    } else {
        p.play('Sorry, You should order something first');
    }
});

// remove or update order items
intent(`(remove|delete|exclude) $(ITEM ${ITEMS_INTENT})`,
    `(remove|delete|exclude) $(NUMBER) $(ITEM ${ITEMS_INTENT})`, p => {
        let order = p.visual.order || {};
        let id = ITEM_ALIASES[p.ITEM.value.toLowerCase()].id;
        if (!order[id]) {
            p.play(`${p.ITEM} has not been ordered yet`);
        } else {
            let quantity = order[id] ? order[id].quantity : 0;
            let deteleQnty = p.NUMBER ? p.NUMBER.number : quantity;

            if (quantity - deteleQnty <= 0) {
                p.play('Removed all ' + p.ITEM.value);
            } else {
                p.play(`Updated ${p.ITEM} quantity to ${quantity - deteleQnty}`);
            }
            p.play({command: 'removeFromCart', item: id, quantity: deteleQnty});
            p.play({command: 'navigation', route: '/cart'});
        }
    });

// play order details
intent(`(my order|order details|details)`, p => {
    let order = p.visual.order;
    if (_.isEmpty(order)) {
        p.play("You have not ordered anything.", "Your cart is empty");
        return;
    }
    p.play("You have ordered:");
    for (let product in order) {
        if (order.hasOwnProperty(product)) {
            p.play(order[product].quantity + " " + order[product].title);
        }
    }
});

// set address
intent(`(set|change|replace) (delivery|) address`, `(delivery|) address is (not correct|invalid)`,
    p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        } else {
            p.play({command: 'highlight', id: 'address'});
            p.play('What is delivery address?');
            p.then(checkout);
        }
    });

const COMPOUND_DELIVERY_INTENT = [
    `Deliver to $(LOC)`,
    `Delivery address (is|) $(LOC)`,
    `Deliver to $(LOC) (at|on|) $(DATE)`,
    `Deliver to $(LOC) (at|on|) $(DATE) (at|on|) $(TIME)`,
    `Deliver (at|on|) $(DATE)`,
    `Delivery date (is|) $(DATE)`,
    `Deliver (at|on|) $(TIME)`,
    `Delivery time (is|) $(TIME)`,
    `Deliver (at|on|) $(DATE) (at|on|) $(TIME)`
]

intent(COMPOUND_DELIVERY_INTENT, p => {

        if (_.isEmpty(p.visual.order) || !p.visual.total) {
            p.play("Your cart is empty, please make an order first");
            return;
        }
        let address = p.visual.address;
        let date = p.visual.date;
        let time = p.visual.time;

        p.play({command: "checkout"});

        if (p.LOC) {
            p.play({command: "address", address: p.LOC.value});
            address = p.LOC.value;
        }
        if (p.DATE || p.TIME) {
            date = p.DATE ? p.DATE.moment.format("MMMM Do") : null;
            time = p.TIME ? p.TIME.value : null;
            p.play({command: "time", time: time, date: date});
        }
        if (playDelivery(p, address, date, time)) {
            p.then(checkout);
        }
    });

// set date/time
intent(`(Let's|) (set|choose|select|change) (delivery|) (time|date)`, `(delivery|) (date|time) is (not correct|invalid)`,
    p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        } else {
            p.play({command: 'highlight', id: 'time'});
            p.play("What is delivery time?");
            p.then(date);
        }
    });

// checkout
intent(`that's (all|it)`, '(ready to|) checkout', p => {
    if (_.isEmpty(p.visual.order) || !p.visual.total) {
        p.play("Your cart is empty, please make an order first");
        return;
    }
    p.play({command: 'navigation', route: '/cart'});
    p.play(`The total amount for your order is: `);
    p.play({command: 'highlight', id: 'total'});
    p.play(`${p.visual.total} dollars`);
    playDelivery(p, p.visual.address, p.visual.date, p.visual.time);
    p.then(checkout);
});

intent(`finish (order|)`, p => {
    if (_.isEmpty(p.visual.order)) {
        p.play("Please, add something to your order first");
    } else {
        p.play({command: "finishOrder"});
    }
});

intent(`what is the total (price|amount) (of the order|for my order|)`,
    `how much is my order`, p => {
    if (p.visual.total && p.visual.total > 0) {
        p.play(`The total amount for your order is: `);
        if (p.visual.route === '/cart') {
            p.play({command: 'highlight', id: 'total'});
        }
        p.play(`${p.visual.total} dollars`);
    } else {
        p.play(`Your cart is empty, please make an order first`)
    }
});

intent(`(how much|what) does $(ITEM ${ITEMS_INTENT}) cost`, `How much is $(ITEM ${ITEMS_INTENT})`, p => {
    let order = p.visual.order || {};
    let price = ITEM_ALIASES[p.ITEM.value.toLowerCase()].price;
    let s = price !== 1 ? "s" : "";
    p.play(`${p.ITEM} (costs|is) ${price} dollar${s}`);
});

intent("Make the address $(LOC)", "Set address to $(LOC)", "Address (is|) $(LOC)", p => {
    p.play({command: "address", address: p.LOC.value});
    p.play({command: `highlight`, id: `address`});
    p.play(`Delivery address is set to ${p.LOC}`);
});

projectAPI.greet = (p, param, callback) => {
    p.play("Welcome to the Food Ordering demo app for food delivery. (How can I help you|What can I get for you|May I take your order|What would you like to order)?");
};