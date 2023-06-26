const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');
const { roles } = require('../../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');


const agoraAppIdschema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    dateISO: {
        type: Number,
    },
    date: {
        type: Number,
    },
    expired: {
        type: Boolean,
        default: false,
    },
    appID: {
        type: String,
    },
    Authorization: {
        type: String,
    },
    cloud_KEY: {
        type: String,
    },
    cloud_secret: {
        type: String,
    }


});

const AgoraAppId = mongoose.model('AgoraAppId', agoraAppIdschema);
module.exports = { AgoraAppId };
