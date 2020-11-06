
radio.onReceivedString(function (receivedString) {
    handleMessage(receivedString)
})
radio.setGroup(27)
// led.enable(false)
let mbId = "1"
let leds = [
    {
        port: "1",
        state: 0,
        pin: ThreePort.One
    },
    {
        port: "2",
        state: 0,
        pin: ThreePort.Two
    },
    {
        port: "3",
        state: 0,
        pin: ThreePort.Three
    }
]
let trileds = [
    {
        port: "1",
        redState: 0,
        greenState: 0,
        blueState: 0,
        pin: TwoPort.One
    },
    {
        port: "2",
        redState: 0,
        greenState: 0,
        blueState: 0,
        pin: TwoPort.Two
    }
]

let robots = [
    {
        id: "1",
        leftMotor: {
            pin: FourPort.Two,
            rotateForward: 1
        },
        rightMotor: {
            pin: FourPort.One,
            rotateForward: 0
        }
    }
]


/*
    Servo List
    You do not need to add or remove any servos, but you can alter the max/min if needed

    stype: s (position) | c (continuous rotation)
    max/min: Clamp rotation speed or position
        rotation extremes: full reverse = -100, full forward = 100
        position extremes: 0 - 180
*/
let servos = [
    {
        port: "1",
        stype: "r",
        pin: FourPort.One,
        state: 0,
        min: -100,
        max: 100
    },
        {
        port: "2",
        pin: FourPort.Two,
        stype: "r",
        state: 0,
        min: -100,
        max: 100
    },
    {
        port: "3",
        pin: FourPort.Three,
        stype: "p",
        state: 0,
        min: 0,
        max: 180
    },
    {
        port: "4",
        pin: FourPort.Four,
        stype: "p",
        state: 0,
        min: 0,
        max: 180
    }
]
hummingbird.startHummingbird()

for (let i = 0; i < 3; i++) {
    controlLed("1", 100)
    basic.pause(300)
    controlLed("1", 0)
    basic.pause(300)
}

function controlLed(id: string, newState: number) {
    let foundLed = leds.find(function (value: any, index: number) {
        return value.port == id
    })
    if(foundLed) {
        if(newState != foundLed.state) {
            hummingbird.setLED(foundLed.pin, newState)
            foundLed.state = newState
        }
        return true
    }
    return false
}

function controlTriLed(id: string, newState: string) {
    let foundTriLed = trileds.find(function (value: any, index: number) {
        return value.port == id
    })
    if(foundTriLed) {
        let newStates = {
            red: convertLed(newState[0]),
            green: convertLed(newState[1]),
            blue: convertLed(newState[2])
        }
        if(newStates.red != foundTriLed.redState || newStates.green != foundTriLed.greenState || newStates.blue != foundTriLed.blueState) {
            hummingbird.setTriLED(TwoPort.One, newStates.red, newStates.green, newStates.blue)
            foundTriLed.redState = newStates.red
            foundTriLed.greenState = newStates.green
            foundTriLed.blueState = newStates.blue
        }
        // basic.showString(`${newStates.red}${newStates.green}${newStates.blue}`)
        return true
    }
    return false
}

function controlServo(id: string, stype: string, newState: number) {
    let foundServo = servos.find(function (value: any, index: number) {
        return (value.port == id && value.stype == stype)
    })
    if(foundServo) {
        if(newState != foundServo.state) {
            newState = Math.constrain(newState, foundServo.min, foundServo.max)
            if(stype == "p") {
                hummingbird.setPositionServo(foundServo.pin, newState)
            } else {
                hummingbird.setRotationServo(foundServo.pin, newState)
            }
            foundServo.state = newState
        }
        return true
    }
    return false
}

function controlBot(id: string, direction: string, speed: number) {
    let foundBot = robots.find(function (value: any, index: number) {
        return (value.id == id)
    })
    if(foundBot) {
        switch(direction) {
            case 'f':
                hummingbird.setRotationServo(foundBot.leftMotor.pin, foundBot.leftMotor.rotateForward ? speed : (speed * -1))
                hummingbird.setRotationServo(foundBot.rightMotor.pin, foundBot.rightMotor.rotateForward ? speed : (speed * -1))
                break;
            case 'b':
                hummingbird.setRotationServo(foundBot.leftMotor.pin, foundBot.leftMotor.rotateForward ? speed * -1 : speed)
                hummingbird.setRotationServo(foundBot.rightMotor.pin, foundBot.rightMotor.rotateForward ? speed * -1 : speed)
                break;
            case 'r':
                hummingbird.setRotationServo(foundBot.leftMotor.pin, foundBot.leftMotor.rotateForward ? speed: speed * -1)
                hummingbird.setRotationServo(foundBot.rightMotor.pin, foundBot.rightMotor.rotateForward ? speed * -1 : speed)
                break;
            case 'l':
                hummingbird.setRotationServo(foundBot.leftMotor.pin, foundBot.leftMotor.rotateForward ? speed * -1 : speed)
                hummingbird.setRotationServo(foundBot.rightMotor.pin, foundBot.rightMotor.rotateForward ? speed : speed * -1)
                break;
            case 's':
                hummingbird.setRotationServo(foundBot.leftMotor.pin, 0)
                hummingbird.setRotationServo(foundBot.rightMotor.pin, 0)
                break;
        }
    } else {
        basic.showString(`Robot ${id} not found`)
    }
}

function convertLed(value: string) {
    return value.toLowerCase() == "f" ? 100 : parseInt(value) * 10
}
function handleMessage(msg: string) {
    if(mbId == msg[0]) {
        let dId = msg[2]
        switch(msg[1]) {
            case "l":
                controlLed(dId, convertLed(msg[3]))
                break
            case "t":
                controlTriLed(dId, msg.substr(3,3))
                break
            case "p":
            case "r":
                controlServo(dId, msg[1], parseInt(msg.substr(3,4)))
                break
            case "b":
                controlBot(dId, msg[3].toLowerCase(), parseInt(msg.substr(4,4)))
                break
        }
    }
}
