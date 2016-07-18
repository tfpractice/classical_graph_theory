module.exports = {
    entry: './src/graph_theory.js',
    output: {
        library: 'classical_graph_theory',
        libraryTarget: 'umd',
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel', // 'babel-loader' is also a legal name to reference 
            query: {
                presets: ['react', 'es2015']
            }
        }]
    }
};