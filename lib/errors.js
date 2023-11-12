module.exports.inexistentNoteId = (noteId) => { 
return { 
    status: 404,
    clientMsg: "Inexistent note", 
    message: "User tried to access note route by an invalid note id",
    value: noteId
}};

module.exports.missingRequiredDataToLogin = () => { 
return {
    status: 400,
    clientMsg: "Invalid Credentials", 
    message: "Missing required data to login"
}};

module.exports.nonExistentUserWithGivenCredentials = (credentials) => {
return { 
    status: 400,
    clientMsg: "Authentication Failed! Check your credentials.", 
    message: "Inexistent user with those credentials",
    value: credentials
}};

module.exports.missingRequiredDataToSignup = () => {
return { 
    status: 400,
    clientMsg: "Invalid User", 
    message: "Missing required data to create user"
}};

module.exports.triedToSignupAlreadySignedUpUser = () => {
return {
    status: 400,
    clientMsg: "This user already exists.", 
    message: "Tried to signup already signed up user"
}};