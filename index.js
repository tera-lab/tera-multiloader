const fs = require('fs-extra')
const path = require('path')
const Process = require('./proc.js')
const reg = require('./reg.js')

module.exports = function MultiLoader(region) {
    if(region !== "jp")
        return

    let base
    let running = {}

    reg.getLocation().then((loc) => {
        base = path.join(loc, '../')
        console.log(`[multilodaer] Detected base: ${base} . Starting...`)

        // force start origin first
        reg.setLocation(pathOf(0))

        // yes fuck it
        fuckXign(0)

        // start watcher
        Process(onStartup, onExit)
    })

    // Process callbacks
    function onStartup(proc) {
        const started = path.join(proc.path, '../../')
        running[started] = true
        console.log(`[multiloader] ${path.basename(started)}(${proc.pid}) started.`)

        let touching
        for(let i = 0; true; i++) {
            touching = pathOf(i)
            if(!running[touching]) {
                if(!fs.existsSync(touching)) {
                    spawnClient(i)
                    console.log(`[multiloader] ${path.basename(touching)} spawned.`)
                }
                else fuckXign(i)

                reg.setLocation(touching)
                console.log(`[multiloader] Switched to ${path.basename(touching)}`)
                break
            }
        }
    }

    function onExit(proc) {
        const exited = path.join(proc.path, '../../')
        running[exited] = false
        console.log(`[multiloader] ${path.basename(exited)} exited.`)
        if(exited === pathOf(0))
            reg.setLocation(pathOf(0))
    }

    function pathOf(order) {
        const child = order ? `-${order}` : ''
        return path.join(base, `TERA${child}/`)
    }

    function spawnClient(order) {
        const newCli = pathOf(order)
        const oriCli = pathOf(0)
        fs.mkdirSync(newCli)
        fs.readdir(oriCli, (err, files) => {
            files.forEach(file => {
                const src = path.join(oriCli, file)
                const dst = path.join(newCli, file)

                if(file === 'Binaries') {
                    try {fs.copySync(src, dst)}
                    catch(e) {pe(e)}
                    fuckXign(order)
                } else if(file === '$Patch') {
                    // don't copy temp files
                } else {
                    const type = fs.statSync(src).isDirectory() ? 'dir' : 'file'
                    fs.symlink(src, dst, type, pe)
                }
            })
        })
    }

    function pe(e) {
        if(e)
            console.log(e)
    }

    function fuckXign(order) {
        fs.remove(path.join(pathOf(order), 'Binaries/XIGNCODE/x3.xem'), pe)
        fs.remove(path.join(pathOf(order), 'Binaries/XIGNCODE/xcorona.xem'), pe)
    }
}
