module.exports.basicError = (message) => {
var clientMsg = "Error on operation.";
return {
    message: message? message : clientMsg,
    clientMsg: clientMsg 
}};

module.exports.unauthorizedOperation = (message) => {
var clientMsg = "Unauthorized operation.";
return {
    status: 401,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.notFound = (message) => {
var clientMsg =  "Not found.";
return {
    status: 404,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.notFoundOrUnavailable = (message) => {
var clientMsg = "Resource does not exist or is not available.";
return {
    status: 404,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.invalidData = (message) => {
var clientMsg = "Invalid data.";
return {
    status: 400,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.dataDoesNotMatch = (message) => {
var clientMsg = "Data does not match.";
return {
    status: 400,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.userAlreadyRegistered = (message) => {
var clientMsg = "User with given email or nickname already exists.";
return {
    status: 400,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.weakPassword = (message) => {
var clientMsg = "Password is too weak.";
return {
    status: 400,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};

module.exports.missingRequiredData = (message) => { 
var clientMsg = "Missing required data.";
return {
    status: 400,
    message: message? message : clientMsg,
    clientMsg: clientMsg
}};