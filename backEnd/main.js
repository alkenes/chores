'use strict';

const CHORE_BUCKET = 'chores';

const Minio = require('minio');

var minioClient = new Minio.Client({
    endPoint: 'minio.local',
    port: 80,
    useSSL: false,
    accessKey: '',
    secretKey:''
});

minioClient.bucketExists(CHORE_BUCKET, function(error, exists) {
    if (error) {
        return console.log(error);
    }

    if (!exists) {
        console.log("Creating 'chores' bucket.");

        minioClient.makeBucket(CHORE_BUCKET, function(error) {
            if (error) {
                return console.log("Error creating bucket.", error);
            }

            console.log("Bucket successfully created.");
        });
    }
});

const server = require('express')();

server.get('/presignedUrl', (request, result) => {
    clientInformation.presignedPutObject(CHORE_BUCKET, request.query.name, (error, url) => {
        if (error) {
            throw error;
        }

        result.end(url);
    });
});

server.get('/', (request, response) => {
    response.sendFile('/home/alkenes/git/chores/frontEnd/index.html');
})

server.listen(8080);