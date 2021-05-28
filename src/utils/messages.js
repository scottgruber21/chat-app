const generateMessage = (username, text) => {
    return {
        username, 
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, location) => {
    return {
        username,
        url: `https://maps.google.com?q=${location.latitude},${location.longitude}`,
        createdAt: new Date().getTime
    }
}

module.exports = {generateMessage, generateLocationMessage}