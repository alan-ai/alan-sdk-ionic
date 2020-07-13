intent("hi", p => {
    p.play("Hi! I'm Alan. I hope you like this tutorial");
});

intent("open $(ORDINAL) tab", p => {
    let availableTabs = new Set([1,2,3]);
    if (availableTabs.has(p.ORDINAL.number)) {
        p.play({command: 'navigation', tabNumber: p.ORDINAL.number});
    } else {
        p.play("The tab with this number not found");
    }
});