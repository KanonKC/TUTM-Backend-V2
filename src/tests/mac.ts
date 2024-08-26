import macaddress from 'macaddress'

// macaddress.one((err, mac) => {
//     if (err) {
//         console.error(err)
//     } else {
//         console.log(mac)
//     }
// })

const auth = false

function authReq(func:()=>any) {
    if (!auth) {
        console.log("Unauthorized")
        return
    }
    func()
}

// @authReq
function doSomething() {
    console.log("Doing something")
}