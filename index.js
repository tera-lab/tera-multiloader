const fs = require('fs-extra')
const path = require('path')
const Process = require('./proc.js')
const reg = require('./reg.js')

module.exports = function MultiLoader(region) {
    if(region !== "jp")
        return

    let clients
    let running = {}
    try {
        clients = require('./clients.json')
    } catch(e) {
        clients = {
            origin: null,
            dummies: []
        }
        serialize()
    }
    
    // check dummy is available (roughly)
    clients.dummies = clients.dummies.filter(cli => fs.existsSync(cli))

    // Forcing start origin first
    if(clients.origin)
        reg.setLocation(clients.origin)

    Process(onStartup, onExit)
    console.log(`[multiloader] ${clients.dummies.length} dummy clients available!`)

    // Process callbacks
    function onStartup(proc) {
        const execDir = path.join(proc.path, '../../')
        running[execDir] = true
        console.log(`[multiloader] ${path.basename(execDir)} started.`)
        if(!clients.origin) {
            clients.origin = execDir
            serialize()
        }

        let nextClient = !running[clients.origin] ? clients.origin : clients.dummies.find((cli) => !running[cli])
        if(!nextClient) {
            nextClient = spawnClient()
            console.log(`[multiloader] New dummy ${path.basename(nextClient)} spawned!`)
        }            
        
        reg.setLocation(nextClient)
        console.log(`[multiloader] ${path.basename(nextClient)} is ready to launch!`)
    }

    function onExit(proc) {
        const execDir = path.join(proc.path, '../../')
        running[execDir] = false
        if(reg.getLocation() !== clients.origin) {
            reg.setLocation(execDir)
            console.log(`[multiloader] ${path.basename(execDir)} is ready to launch!`)
        }
    }

    function spawnClient() {
        const newClient = path.join(clients.origin, `../TERA-${clients.dummies.length + 1}/`)
        fs.mkdirSync(newClient)
        fs.readdir(clients.origin, (err, files) => {
            files.forEach(file => {
                const src = path.join(clients.origin, file)
                const dst = path.join(newClient, file)

                if(file === 'Binaries') {
                    fs.copySync(src, dst)
                } else if(file === '$Patch') {
                    // pass
                } else {
                    const type = fs.statSync(src).isDirectory() ? 'dir' : 'file'
                    fs.symlinkSync(src, dst, type)
                }
            })
        })
        
        clients.dummies.push(newClient)
        serialize()
        return newClient
    }

    function serialize() {
        fs.writeFile(
            path.join(__dirname, 'clients.json'),
            JSON.stringify(clients),
            'utf8',
            () => {}
        )
    }
}
