const config = {
    type: 'app',
    title: 'Program Configuration',
    description:"Tracker and Event Programs management tool",
    entryPoints: {
        app: './src/App.js',
    },
    minDHIS2Version:'2.36',
    maxDHIS2Version:'2.38'
}

module.exports = config
