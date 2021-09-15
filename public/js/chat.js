// io()
const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//recieve event from the server
// socket.on('countUpdated',(count)=>{
// console.log('count has been updated',count);
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked');
//     socket.emit('increment') //sent to the server 
// })

//template
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationmessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) //from qs.min.js in chat.html


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('Message',(mss)=>{
console.log(mss);
const html=Mustache.render(messageTemplate,{
    username:mss.username,
    Message:mss.text,
    // createdAt:mss.createdAt
    createdAt:moment(mss.createdAt).format('h:mm a')  //in index.html moment.js is there
})
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const htmlurl=Mustache.render(locationmessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',htmlurl)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
const html =Mustache.render(sidebarTemplate,{
    room,users
})
document.querySelector('#sidebar').innerHTML=html
})
// socket.on('Message',(mss)=>{
//     console.log(mss);
//     })
    
// document.querySelector('#message-form').addEventListener('submit',(e)=>{
//     e.preventDefault()
//     // const message=document.querySelector('input').value    
//     const message=e.target.elements.msgnm.value   //from name from input tag in index.html
//     socket.emit('sendMessage',message) //sent to the server 
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    // const message=document.querySelector('input').value    
    
    //disable button after first time submit
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.msgnm.value   //from name from input tag in index.html
    //acknlowdgment hasbeen recived(error)
    socket.emit('sendMessage',message,(error)=>{
        // enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()// focus the cursor 
        if(error){
            return console.log(error);            
        }
        console.log('message delivered');
        
        
    }) //sent to the server 
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("geoloaction not supported by ur browser")
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
    //  console.log(position);
     socket.emit('sendLocation',{
         latitude:position.coords.latitude,
         longitude:position.coords.longitude
     },()=>{
         $sendLocationButton.removeAttribute('disabled')
        //  console.log('Location Shared');
         
     })
    })
})

socket.emit('join',{username,room},(error)=>{
if (error) {
    alert(error)
    location.href="/"
}
})