const regedit = require('regedit')

const addr = 'HKCU\\Software\\GameOn\\Pmang\\tera'

module.exports = {
    getLocation() {
        regedit.list(addr, (err, res) => {
            const loc = res[addr].values['location'].value
            return loc ? loc : null
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
