module.exports.inexistentNoteId = (noteId) => { 
return { 
    status: 404,
    clientMsg: "Inexistent note", 
    message: "User tried to access note route by an invalid note id",
    value: noteId
}};

module.exports.basicNoteError = (message, clientmsg ) => {
return {
    status: 400,
    clientMsg: clientmsg, 
    message: message
}};

module.exports.missingRequiredDataToLogin = () => { 
return {
    status: 400,
    clientMsg: "Invalid Credentials", 
    message: "Missing required data to login"
}};

module.exports.nonExistentUserWithGivenCredentials = (credentials, message) => {
return { 
    status: 400,
    clientMsg: "Authentication Failed! Check your credentials.", 
    message: message,
    value: credentials
}};

module.exports.missingRequiredDataToSignup = () => {
return { 
    status: 400,
    clientMsg: "Invalid User", 
    message: "Missing required data to create user"
}};

module.exports.basicUserError = (message, clientmsg ) => {
return {
    status: 400,
    clientMsg: clientmsg, 
    message: message
}};