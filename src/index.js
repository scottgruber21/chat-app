const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const { send } = require('process')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

app.use(express.urlencoded({entended: false}))

let message = ''

io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    socket.on('join', (options, callback) => {

        const {error, user} = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    // socket.on('message', message => {
    //     const user = getUser(socket.id)
    //     io.to(user.room).emit('message', generateMessage(user.username, message))
    // })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    }
    )

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location))
        callback()
    })
})



server.listen(port, () => {
    console.log(`Listening on ${port}`)
})