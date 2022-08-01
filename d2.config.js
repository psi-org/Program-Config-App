const config = {
    type: 'app',
    title: 'Program Config App',
    short_name:"Program Config App",
    description:"Tracker Programs management tool",
    entryPoints: {
        app: './src/App.js',
    },
    minDHIS2Version:'2.36',
    maxDHIS2Version:'2.38'
}

module.exports = config
