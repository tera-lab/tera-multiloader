const { snapshot } = require('process-list')

let Processes = {}

module.exports = function Process(onStartup, onExit) {
    snapshot('name', 'path', 'pid').then(procs => {
        let newProcesses = {}
        for(let proc of procs) {
            if(proc.name.toUpperCase() === 'TERA.EXE') {
                if(!Processes[proc.pid]) {
                    if(proc.path) {
                        onStartup(proc)
                        newProcesses[proc.pid] = proc
                    }
                } else {
                    newProcesses[proc.pid] = Processes[proc.pid]
                }
            }
        }

        for(let pid in Processes) {
            if(!newProcesses[pid])
                onExit(Processes[pid])
        }

        Processes = newProcesses
        setTimeout(() => Process(onStartup, onExit), 1000)
    })
}
