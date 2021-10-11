'use strict';

const fs = require('fs');
const config = require('config');
const mongodb = require('mongodb');
const cfg = config.get('mongo') || {};

const Mongo = {
    bucket: null,
    client: null,
    db: null
};

Mongo.conect = async (database = null, useBucket = true) => {
    try {
        if (!database) {
            database = cfg.database;
        }
        Mongo.client = await mongodb.MongoClient.connect(
            'mongodb://' + (cfg.user ? `${cfg.user}:${cfg.pass}@` : '') + `${cfg.host}:${cfg.port}`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        Mongo.db = await Mongo.client.db(database);
        if (useBucket) {
            Mongo.bucket = new mongodb.GridFSBucket(Mongo.db, {
                bucketName: 'attachments'
            });
        }
        console.log(`[MongoDB] Database '${database}' connected with success${useBucket ? ' using bucket' : ''}.`);
        return true;
    } catch (err) {
        console.log('[MongoDB] Error at connect:', err);
        if (Mongo.client) {
            Mongo.client.close();
        }
    }
    return false;
};

Mongo.objectId = async (id) => {
    return await new mongodb.ObjectID(id);
};

Mongo.objectIdWithTimestamp = async (timestamp) => {
    if (typeof (timestamp) === 'string') {
        timestamp = new Date(timestamp);
    }
    const hexSeconds = Math.floor(timestamp / 1000).toString(16);
    return await Mongo.objectId(hexSeconds + '0000000000000000');
};

Mongo.find = async (collection, query, options = {}) => {
    let conn = Mongo.db;
    if (options.database) {
        conn = await Mongo.client.db(options.database);
    }
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB Find:', collection, query, options);
    }
    try {
        return await conn.collection(collection).find(query, options).toArray();
    } catch (err) {
        console.error('[MongoDB] Error:', err.message);
        return null;
    }
};

Mongo.findOne = async (collection, query = {}, options = {}) => {
    let conn = Mongo.db;
    if (options.database) {
        conn = await Mongo.client.db(options.database);
    }
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB Find:', collection, query, options);
    }
    try {
        return await conn.collection(collection).findOne(query, options);
    } catch (err) {
        console.error('[MongoDB] Error:', err.message);
        return null;
    }
};

Mongo.insert = async (collection, data, options = {}) => {
    let conn = Mongo.db;
    if (options.database) {
        conn = await Mongo.client.db(options.database);
    }
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB Insert:', collection, data, options);
    }
    try {
        return await conn.collection(collection).insertOne(data);
    } catch (err) {
        console.error('[MongoDB] Error:', err.message);
        return null;
    }
};

Mongo.update = async (collection, query, data, options = { upsert: true }) => {
    let conn = Mongo.db;
    if (options.database) {
        conn = await Mongo.client.db(options.database);
    }
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB Update:', collection, query, data);
    }
    try {
        return await conn.collection(collection).updateOne(query, { '$set': data }, { upsert: options.upsert });
    } catch (err) {
        console.error('[MongoDB] Error:', err.message);
        return null;
    }
};

Mongo.delete = async (collection, query, options = {}) => {
    let conn = Mongo.db;
    if (options.database) {
        conn = await Mongo.client.db(options.database);
    }
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB Delete:', collection, query);
    }
    try {
        return await conn.collection(collection).deleteOne(query);
    } catch (err) {
        console.error('[MongoDB] Error:', err.message);
        return null;
    }
};

Mongo.fileUpload = async (path) => {
    const readStream = fs.createReadStream(path);
    const uploadStream = await Mongo.bucket.openUploadStream(path);
    uploadStream.on('error', (err) => {
        console.error('[MongoDB] Error:', err);
    });
    return await readStream.pipe(uploadStream);
};

Mongo.fileDownload = async (id) => {
    const data = [];
    if (config.get('server.debug')) {
        console.log('[DEBUG] MongoDB fileDownload:', id);
    }
    const chunks = await Mongo.find(
        'attachments.chunks',
        { files_id: await Mongo.objectId(id) },
        { sort: [['n', 'asc']] }
    );
    for (const c in chunks) {
        data.push(chunks[c].data.buffer);
    }
    return await Buffer.concat(data);
};

(async () => {
    return await Mongo.conect();
})();

module.exports = Mongo;
