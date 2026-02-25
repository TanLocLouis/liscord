db = db.getSiblingDB('quikbin');
db.bins.createIndex({ "closeBinAt": 1 }, { expireAfterSeconds: 0 });