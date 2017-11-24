$(() => {
    const URL = '/upload.file'
    const progressBar = $('progress')
    const input = $('.file-input')
    const fileName = $('.file-name')
    const BTN = {
        hide() { $('.show-info-item').hide() },
        show() { $('.show-info-item').show() },
        begin: $('.btn-begin'),
        pause: $('.btn-pause')
    }
    BTN.hide()
    let fileInfo = {}
    let xhr
    input.on('change', e => {
        let file = e.target.files[0]
        if (file) {
            // change时修改显示文件名以及服务端验证进度
            fileName.html('<i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>' + file.name)
            BTN.hide()
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
                    fileName.html(file.name)
                    if (file.size === loaded) {
                        alert('complete!')
                    } else {
                        BTN.show()
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
        fileName.html('<i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>' + file.name)
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                fileName.html(file.name)
                BTN.hide()
                const res = JSON.parse(xhr.responseText)
                if (res.error) {
                    alert(res.error)
                } else {
                    alert('complete!')
                }
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