const Database = require('./services/database');

Database.connect().then(d => console.log('d:', d));
