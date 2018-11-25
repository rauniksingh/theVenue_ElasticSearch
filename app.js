require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const helmet = require('helmet');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const chalk = require('chalk');
const elasticsearch = require('elasticsearch');
// instantiate an elasticsearch client
const client = new elasticsearch.Client({
   hosts: [ 'http://localhost:9200']
});
// ping the client to be sure Elasticsearch is up
client.ping({
    requestTimeout: 30000,
}, function(error) {
// at this point, eastic search is down, please check your Elasticsearch service
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});
app.get('/search', function (req, res){
    // declare the query object to search elastic search and return only 200 results from the first result found. 
    // also match any data where the name is like the query string sent in
    let body = {
      size: 800,
      from: 0, 
      query: {
        match: {
            name: req.query['q']
        }
      }
    }
    // perform the actual search passing in the index, the search query and the type
    console.log(body)
    client.search({index:'scotch.io-tutorial',  body:body, type:'cities_list'})
    .then(results => {
      res.send(results.hits.hits);
    })
    .catch(err=>{
      console.log(err)
      res.send([]+err);
    });
})
app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(compression());
app.use(mongoSanitize());
app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//--------------- Cluster Code --------- 
if(cluster.isMaster){
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exist', (worker, code, signal) => {
        console.log(chalk.red(' [ ✗ ] '), `worker ${worker.process.pid} died`);
    })
}else{
    try {
        app.listen(process.env.PORT, () => {
            console.log(chalk.blue(' [ ✓ ] '), 'Running on port : ' + process.env.PORT);
            console.log(chalk.white(' [ ✓ ] '), "Child process spawn with pId : " + process.pid);
        });
    } catch (error) {
        return console.error(chalk.red(' [ ✗ ] '), error);
    }
}

//------------------------------------------

app.get('/favicon.ico', (req, res) => res.status(204));

app.use('/api/v1/menu', require('./routes/menuRoutes'));

//-----Database Connection----------
try {
    let dev_db_url = 'mongodb://aravind:aravind1997@ds149724.mlab.com:49724/hypto';
    const mongoDB = process.env.MONGODB_URI || dev_db_url;
    mongoose.connect(mongoDB, { useNewUrlParser: true });
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
} catch (error) {
    return console.error(chalk.red(' [ ✗ ] '), error);
}
//---------------------------------------
