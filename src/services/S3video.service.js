const httpStatus = require('http-status');
const videoUploadService = require('../models/videoUpload.model');
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk');
const fs = require('fs')

const videoupload = async (file, path, format) => {
    const s3 = new AWS.S3({
        accessKeyId: 'AKIA3323XNN7Y2RU77UG',
        secretAccessKey: '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',
        region: 'ap-south-1',
    });
    const fileStream = fs.createReadStream(file.path);

    let params = {
        Bucket: 'streamingupload',
        Key: path + file.originalname,
        Body: fileStream,
    };
    return new Promise((resolve, reject) => {
        const s3Upload = s3.upload(params, (err, data) => {
            if (err) {
                reject({ message: "vide upload failed" })
            } else {
                resolve(data);
            }
        });
        s3Upload.on('httpUploadProgress', function (progress) {
            console.log('Progress:', progress.loaded, '/', progress.total); 
        });
    });
}
module.exports = {

    videoupload
}