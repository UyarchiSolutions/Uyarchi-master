const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const AWS = require('aws-sdk');

// const ffmpeg = require('ffmpeg-stream');
var ffmpeg = require('fluent-ffmpeg');

const axios = require('axios');
const fs = require('fs');

AWS.config.update({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
});

const m3u8Url = 'https://streamingupload.s3.ap-south-1.amazonaws.com/8f2f0f8730bf4e30babba181abbb03e9/11649/a91917ad714784172b3004b1bef13642_e8eea45b-faf8-4bfb-b276-af03090d208f.m3u8';

const video_convert_now = async (data) => {
    try {
        const m3u8Content = await downloadM3U8(m3u8Url);
        const tempM3u8Path = 'temp/convert/temps.m3u8';
        const tempMP4Path = 'temp/convert/temp.mp4';

        // Save the M3U8 content to a local file
        fs.writeFileSync(tempM3u8Path, m3u8Content);

        // Convert M3U8 to MP4
        // setTimeout(async () => {
            await convertToMP4(tempM3u8Path, tempMP4Path);
        // }, 1000)

        // Replace with your AWS S3 bucket details
        const bucketName = 'realestatevideoupload';
        const key = 'path/to/uploaded/file.mp4';

        // Upload the MP4 to AWS S3
        // await uploadToS3(tempMP4Path, bucketName, key);

        // Clean up temporary files if needed
        // fs.unlinkSync(tempM3u8Path);
        // fs.unlinkSync(tempMP4Path);
    } catch (error) {
        console.error('Error:', error);
    }
};

async function downloadM3U8(url) {
    try {
        return new Promise(async (resolve, reject) => {

            const response = await axios.get(url);
            resolve(response.data);

        })
    } catch (error) {
        console.error('Error downloading M3U8:', error);
        throw error;
    }
}
function convertToMP4(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .on('end', () => {
                resolve(outputPath);
                console.log(outputPath, 66566566)
            })
            .on('error', (err) => {
                console.log(err, 66566566)
                reject(err)

            })
            .run();
    });
}
async function uploadToS3(filePath, bucketName, key) {
    try {
        const fileContent = fs.readFileSync(filePath);

        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileContent
        };

        const uploadResult = await s3.upload(params).promise();
        console.log('Upload successful:', uploadResult.Location);
        return uploadResult.Location;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
}


module.exports = {
    video_convert_now,
};