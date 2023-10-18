module.exports.inexistentNoteId = (noteId) => { 
return { 
    status: 404,
    clientMsg: "Inexistent note", 
    message: "User tried to access note route by an invalid note id",
    value: noteId
}};