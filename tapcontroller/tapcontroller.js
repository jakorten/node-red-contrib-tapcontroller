/**
 * Copyright 2020 Johan Korten
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    var i2cBus = require("i2c-bus");
    var Pca9685Driver = require("pca9685").Pca9685Driver;

    String.prototype.endsWith = function(suffix) {
        return this.match(suffix + '$') == suffix
    }

    function TapController_Node(config) {
        RED.nodes.createNode(this, config)
        let maxTaps = 5;

        this.topic = config.topic
        if (this.topic.endsWith('/') == false) this.topic += '/'

        var node = this

        var icAddress = parseInt(config.address)
        /*
        var mcp = new MCP({
            address: icAddress, //all address pins pulled low
            device: config.device, // Model B
            debug: false,
        })*/

        // icAddress = 0x60 // (default)
        var options = {
            i2c: i2cBus.openSync(1),
            address: icAddress,
            frequency: 50,
            debug: false
        }

        this.on('input', function(msg) {
            this.status({
                fill: 'red',
                shape: 'dot',
                text: 'Busy`'
            })
            //if (msg.topic.toUpperCase().indexOf('ALL') > -1) {
            console.log("Message: " + msg)

            var tapNum   = get_tapNum_from_topic(msg.topic)
            var tapState = get_tapState_from_topic(msg.topic)

            console.log("Tap: " + tapNum + " - " + tapState)

            if ((tapNum >= 0 && tapNum < maxTaps) && (tapState.toUpperCase() == "OPEN") || (tapState.toUpperCase() == "CLOSE") || (tapState.toUpperCase() == "OFF")) {
              pwm = new Pca9685Driver(options, function(err) {
                  if (err) {
                      console.error("Communication with PCA9685 failed!");
                      process.exit(-1);
                  }
                  console.log("Connected to PCA9685");

                  // Turn on channel 3 (100% power)
                  if (tapState.toUpperCase() == "OPEN") {
                      pwm.channelOn(tapNum * 2);
                      pwm.channelOff(tapNum * 2 + 1, function() {
                        if (err) {
                            console.error("Error turning off channel for tap: " + tapNum + ".");
                        } else {
                            console.log("Tap " + tapNum + " was set to: " + tapState.toUpperCase());
                        }
                      });
                  }
                  if (tapState.toUpperCase() == "OPEN") {
                      pwm.channelOn(tapNum * 2 + 1);
                      pwm.channelOff(tapNum * 2, function() {
                          if (err) {
                              console.error("Error turning off channel for tap: " + tapNum + ".");
                          } else {
                              console.log("Tap " + tapNum + " was set to: " + tapState.toUpperCase());
                          }
                      });
                  }
                  if (tapState.toUpperCase() == "OFF") {
                      pwm.channelOff(tapNum * 2, function() {
                          if (err) {
                              console.error("Error turning off channel.");
                          } else {
                              console.log("Tap was set to: " + tapState.toUpperCase());
                          }
                      });
                      pwm.channelOff(tapNum * 2 + 1, function() {
                          if (err) {
                              console.error("Error turning off channel.");
                          } else {
                              console.log("Tap was set to: " + tapState.toUpperCase());
                          }
                      });
                  }


              })
            } else {
                node.warn(
                    'Topic should contain a valid tap number in the range 0.. ' + maxTaps + ' followed by a "/" and OPEN or CLOSE command [' +
                    msg.topic +
                    ']'
                )
            }

            this.status({
                fill: 'green',
                shape: 'dot',
                text: 'Ready'
            })
        })

        /*
        function send_status_message(pin, topic, state) {
            var statusMsg = {}
            statusMsg.topic = topic + pin
            statusMsg.payload = 'Sent ' + state + ' to output ' + pin
            node.send(statusMsg)
        }

        function mcp23017_send_status() {

            for (var _pin = 8; _pin < 16; _pin++) {

                mcp.pinMode(_pin, mcp.INPUT); //if you want them to be inputs
                mcp.pinMode(_pin, mcp.INPUT_PULLUP); //if you want them to be pullup inputs
                mcp.digitalRead(_pin, function(pin, err, value) {

                    var statusMsg = {}
                    statusMsg.topic = node.topic + pin
                    statusMsg.payload = {
                        pin: pin,
                        value: value ? 'OFF' : 'ON'
                    }
                    node.send(statusMsg)
                })
            }
        }

        function mcp23017_set_all_outputs(state) {
            for (var pin = 0; pin < 16; pin++) {
                mcp23017_process(pin, state)
            }
        }

        function mcp23017_process(pin, state) {
            mcp.digitalWrite(pin, state == 'ON' ? mcp.LOW : mcp.HIGH)
        }
        */
        function get_tapState_from_topic(topic) {
            var parts = topic.split('/')
            var index = parts.length - 1
            return parseInt(parts[index])
        }

        function get_tapNum_from_topic(topic) {
            var parts = topic.split('/')
            var index = parts.length - 2
            return parseInt(parts[index])
        }
        /*

        function get_pin_from_topic(topic) {
            var parts = topic.split('/')
            var index = parts.length - 1
            return parseInt(parts[index])
        }
        */

        /*
          mcp.digitalRead(0, function (err, value) {
              console.log('Pin 0', value);
            });
          */
    }

    RED.nodes.registerType('tapcontroller', TapController_Node)
}

/*
var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x60,
    frequency: 50,
    debug: false
};
pwm = new Pca9685Driver(options, function(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("Initialization done");

    // Turn on channel 3 (100% power)
    pwm.channelOn(0);
    setTimeout(() => {  console.log("World!"); }, 10000);

    /*
    setTimeout(() => {  console.log("World!"); }, 10000);

    // Turn off all power to channel 6
    // (with optional callback)
    pwm.channelOff(0, function() {
        if (err) {
            console.error("Error turning off channel.");
        } else {
            console.log("Channel 0 is off.");
        }
    });* /

});
*/
