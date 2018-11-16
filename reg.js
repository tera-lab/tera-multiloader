const regedit = require('regedit')

const addr = 'HKCU\\Software\\GameOn\\Pmang\\tera'

module.exports = {
    getLocation() {
        return new Promise((resolve, reject) => {
            regedit.list(addr, (err, res) => {
                const loc = res[addr].values['location'].value
                resolve(loc)
            })
        })
    },
    
    setLocation(location) {
        const toPut = {
            value: location,
            type: 'REG_SZ'
        }
        
        regedit.putValue({
            [addr]: {
                location: toPut,
                client_location: toPut
            }
        }, (e) => {if(e) console.log(e)})
    }
}
