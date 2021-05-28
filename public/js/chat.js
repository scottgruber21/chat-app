const socket = io()
const $textField = document.querySelector('#textField')
const $form = document.querySelector('#message-form')
const $sendLocation = document.querySelector('#send-location')
const $formSubmit = document.querySelector('#form-submit')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset + 20){
        $messages.scrollTop = $messages.scrollHeight
    }
}


$form.addEventListener('submit', e => {
    e.preventDefault()
    $formSubmit.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', $textField.value, (error) => {

        $formSubmit.removeAttribute('disabled')
        $textField.value=''
        $textField.focus()

        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })

})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$sendLocation.addEventListener('click', () => {

    $sendLocation.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocation.removeAttribute('disabled')
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log('Location shared!')
        })
    })
})

socket.on('locationMessage', location => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username, room}, error => {
    if(error){
        alert(error)
        location.href="/"
    }
})