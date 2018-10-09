import axios from 'axios'
import { saveAs } from 'file-saver'

let canvas, context, input, mouse_status, mx, my, crop_x, crop_y
let image, image_name, image_width, image_height, image_scale, image_x, image_y, image_status
const canvas_width = 500
const canvas_height = 500
const canvas_color = 'rgba(0,0,0,0.8)'
const crop_width = 300
const crop_height = 200

document.body.onload = () => {
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    context = canvas.getContext('2d')

    input = document.createElement('input')
    input.type = "file"
    input.style.display = 'none'
    input.accept = "image/x-png,image/gif,image/jpeg"
    document.body.appendChild(input)
    
    init()
}

const init = () => {
    canvas.width = canvas_width
    canvas.height = canvas_height
    canvas.addEventListener('mousedown', mDown)
    canvas.addEventListener('mousemove', mMove)
    canvas.addEventListener('mouseup', mUp)
    canvas.addEventListener('dblclick', () => input.click())
    input.addEventListener('change', selectedFile)
    window.addEventListener('keydown', keyDown)

    crop_x = ((canvas_width - crop_width)/2)
    crop_y = ((canvas_height - crop_height)/2)

    draw()
}

const selectedFile = (e) => {
    var files = e.target.files
    if (!files.length) return
    image_name = files[0].name
    var image = new Image();
    var reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result)
    reader.readAsDataURL(files[0]);
}

const loadImage = (url) => {
    image = new Image()
    image.onload = () => handleImageReady()
    image.src = url
}

const handleImageReady = () => {
    const wRatio = crop_width/image.width
    const hRatio = crop_height/image.height
    if (wRatio > hRatio) {
        image_scale = wRatio
        image_width = image.width * image_scale
        image_height = image.height * image_scale
    } else {
        image_scale = hRatio
        image_width = image.width * image_scale
        image_height = image.height * image_scale
    }
    image_x = ((crop_width - image_width) / 2) + crop_x
    image_y = ((crop_height - image_height) / 2) + crop_y
    image_status = true
    draw()
}

const keyDown = (e) => {
    if (e.key == 's' && e.altKey && image_status) {
        save()
    }
    if (e.key == 'x' && e.altKey && image_status) {
        render()
    }
}

const mDown = (e) => {
    mouse_status = true
    mx = e.clientX - e.target.offsetLeft
    my = e.clientY - e.target.offsetTop
}

const mUp = (e) => {
    mouse_status = false
}

const mMove = (e) => {
    if (mouse_status) {
        let px = e.clientX - e.target.offsetLeft
        let py = e.clientY - e.target.offsetTop

        if (e.altKey) {
            image_scale = image_scale - ((py - my) * 0.001)
            image_x = image_x - (((image.width * image_scale) - image_width)/2)
            image_y = image_y - (((image.height * image_scale) - image_height)/2)
            image_width = image.width * image_scale
            image_height = image.height * image_scale
        } else {
            let posX = image_x
            let posY = image_y
            image_x += (px - mx)
            image_y += (py - my)
        }

        mx = px
        my = py
        draw()
    }
}

const draw = () => {
    context.clearRect(0, 0, canvas_width, canvas_height)
    paintBox()
    paintImage()
}

const paintBox = () => {
    context.save()
	context.translate(0, 0)
    context.fillStyle = canvas_color
    context.beginPath()
    context.rect(crop_x, crop_y, crop_width, crop_height)
	context.rect(canvas_width, 0, -canvas_width, canvas_height)
	context.fill('evenodd')
	context.restore()
}

const paintImage = () => {
    if (image_status) {
        context.save()
        context.globalCompositeOperation = 'destination-over'
        context.drawImage(image, image_x, image_y, image_width, image_height)
        context.restore()
    }
}

const save = () => {
    let c = document.createElement('canvas')
    c.width = crop_width
    c.height = crop_height
    c.getContext('2d').drawImage(image, image_x - crop_x, image_y - crop_y, image_width, image_height)
    c.toBlob((blob) => {
        saveAs(blob, image_name)
    })
    /*
    let img = new Image()
    img.onload = () => { 
        window.location.href = img.src.replace('image/jpeg', 'image/octet-stream')
    }
    img.src = c.toDataURL('image/jpeg')
    */
}

const render = () => {
    let c = document.createElement('canvas')
    c.width = crop_width
    c.height = crop_height
    c.getContext('2d').drawImage(image, image_x - crop_x, image_y - crop_y, image_width, image_height)    
    c.toBlob((blob) => send(blob))
}

const send = async (blob) => {
    let data = new FormData()
    data.append('name', image_name)
    data.append('file', blob)
    let res = await axios.post('http://upload-image.test/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            let porc = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
            console.log(porc + '%')
        }
    })  
    alert(res.data)
    console.log(res)
}