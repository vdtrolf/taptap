'use strict';

const requestserverReq = require("./requestserver.js");
let createResponse = requestserverReq.createResponse;

console.log('Loading tap tap function');

exports.handler = async (event) => {
    let sessionId = "";
    let responseCode = 200;
    console.log("request: " + JSON.stringify(event));

    if (event.queryStringParameters && event.queryStringParameters.sessionId) {
        console.log("Received sessionId: " + event.queryStringParameters.sessionId);
        sessionId = event.queryStringParameters.sessionId;
    }

    let responseBody = createResponse(event.pathParameters, event.queryStringParameters, sessionId);

    let response = {
        statusCode: responseCode,
        headers: {
            "x-custom-header" : "tap tap header value"
        },
        body: JSON.stringify(responseBody)
    };
    console.log("response: " + JSON.stringify(response))
    return response;
};
