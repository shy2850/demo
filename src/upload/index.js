$(() => {
    const URL = '/upload.file'
    const progressBar = $('progress')
    const input = $('.file-input')
    const fileName = $('.file-name')
    const BTN = {
        begin: $('.btn-begin'),
        pause: $('.btn-pause')
    }
    let fileInfo = {}
    let xhr
    input.on('change', e => {
        let file = e.target.files[0]
        if (file) {
            fileName.text(file.name)
            BTN.begin.hide()
            let reader = new FileReader()
            reader.onload = (e) => {
                const buffer = e.currentTarget.result
                const view = new Uint8Array(buffer)
                const md5 = MD5(view.toString())
                fetch(URL + '?' + md5)
                .then(res => res.json())
                .then(({ loaded }) => {
                    progressBar.attr({
                        value: loaded * 100 / file.size
                    })
                    if (file.size === loaded) {
                        alert('complete!')
                    } else {
                        BTN.begin.show()
                    }
                    fileInfo = {
                        file,
                        buffer,
                        md5,
                        loaded
                    }
                })
            }
            reader.readAsArrayBuffer(file)
        }
    })

    const uploadFile = () => {
        const { file, buffer, md5 } = fileInfo
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                BTN.begin.hide()
                alert('complete!')
            }
        }
        xhr.upload.addEventListener('progress', e => fetch(URL + '?' + md5)
            .then(res => res.json())
            .then(({loaded}) => {
                fileInfo.loaded = loaded
                progressBar.attr({
                    value: loaded * 100 / file.size
                })
            }))
        xhr.open('POST', URL + '?' + md5, true)
        xhr.send(buffer.slice(fileInfo.loaded))
    }
    BTN.begin.on('click', uploadFile)
    BTN.pause.on('click', () => {
        xhr && xhr.abort()
    })
})