module.exports = {
    name: 'Freeze Graph',
    description: 'Freezes the Graph',
    icon: require('images/lock.svg'),
    widgetList: {
        showOn: 'none',
    },
    content: {
        template: {
            execute: 'auto',
            name: 'viva-freeze',
        },
    },
    lazy: true,
};
