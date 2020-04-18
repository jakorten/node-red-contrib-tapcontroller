node-red-contrib-tapcontroller
==============================

A Node-RED wrapper of of the node-pca9685 library for the I2C PCA9685 I/O Expander on a Raspberry Pi.
It assumes 5 2-Channel motor drivers are connected to the PCA9685.

It currently only supports writing to the chip. Though you can request a status which will generate a message per pin on the current state.

**NOTE** The outputs are inverted:

/0/CLOSE will close valve 0
/1/OPEN will open valve 1
/2/OFF will disable outputs for tap 2


ToDo: change other information...

This is because I'm working with Sainsmart relay boards. See to-do below!

## Prerequisites

In order to use this module with the Raspberry Pi running Raspbian you have to have [node.js](https://nodejs.org/) and [node-mcp23017](https://github.com/kaihenzler/node-mcp23017)

npm install i2c-bus
In case you run into issues installing i2c-bus npm:

````
sudo rm -rf ~/node_modules/i2c-bus
sudo chmod +rwx ~/node_modules
sudo chown -R $USER /home/pi/

npm install i2c-bus
````

## Installation

install via npm. just type the following in the terminal/console

````bash
cd ~/.node-red
npm install node-red-contrib-mcp23017
````

## Usage

### Sample Workflow
![Sample Workflow](https://github.com/afulki/node-red-contrib-mcp23017/raw/master/workflow.png)

This workflow shows a number of possible triggers feeding the common hardware interface node. The hardware is controlled via the contened of the payload (ON|OFF) and the Topic provided.

The topic path is not important, except it must end in a number 0..15 or the words ALL or STATUS.

e.g.

These require a payload containing either "ON" or "OFF":

* "home/sprinkler/0"
* "home/devices/control/relay/10"
* "5"
* "home/sprinklers/all"

Status does not need or rather ignores the payload:

* "home/sprinklers/status"

When the status topic is received, the node generates a message per pin as a json object and it can be routed out to MQTT as shown in the example above.

### Configuration
![Node Configuration](https://github.com/afulki/node-red-contrib-mcp23017/raw/master/configure.png)

#### Topic

The topic is used to define the root of the outgoinf topic for status messages, in the example shown it says "devices/sprinklers/", this will results in "devices/sprinklers/0" through "devices/sprinlers/16" with their associated payloads.

**Example Payload:**
````json
{"pin":15,"value":"OFF"}
````

### Example Inject to get status
![Inject Node Configuration](https://github.com/afulki/node-red-contrib-mcp23017/raw/master/get-status.png)

## To Do

I want to add a checkbox to allow the ON/OFF to HIGH/LOW mapping to be inverted, to allow a more logical ON -> HIGH, OFF -> LOW.



## Acknowledgement

Built using the [node-mcp2301 library on github](https://github.com/kaihenzler/node-mcp23017) by kaihenzler (Kai Henzler)
