import { expect } from 'chai';

import * as fs from 'fs'
import * as path from 'path';
import Container from '../src/core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from '../src/core/listener';
import Api from '../src/core/api';
import Main from '../src/main';
import Stepper from '../src/core/stepper';
import VideoRecorder from '../src/core/video.recorder';
import ProfileRecorder from '../src/core/profile.recorder';
import SnapshotRecorder from '../src/core/snapshot.recorder';
import NetworkRecorder from '../src/core/network.recorder';
import * as schedule from 'node-schedule';


const main = Container.get<Main>(Main)
const listener = Container.get<Listener>(Listener);
const api = Container.get<Api>(Api);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);

describe('Api test', function() {
  it('Api commands', function() {
    
    main.run(30, "test", 2000, (tab) => {

      const url = tab.webSocketDebuggerUrl;
          
      const ws = new WebSocket(url);

      listener.setup(ws, () => {
          console.log("Websocket channel opened. Enabling runtime namespace")
        
          recorder.start("test", 100)
          snapshotRecorder.start("test", 100);
          networkRecorder.start("test")

          listener.sendAndRegister({method: "Runtime.enable"})
          listener.sendAndRegister({method: "Profile.enable"})
          listener.sendAndRegister({method: "Page.enable"})
  

          profileRecorder.start()

          stepper.execute(`
            goto https://www.funkykarts.rocks/demo.html
            

            key Enter
            
            sleep 1500
          `, "test", 5000)
        })


    
    })

  });

  it('parser', function() {
    
      const listener = Container.get<Listener>(Listener);
      const api = Container.get<Api>(Api);
      const stepper = Container.get<Stepper>(Stepper);


      let tokens = stepper.tokenize('goto https://www.google.com')
      expect(tokens.length).equal(2, "No correct parsing 'goto https://www.google.com'")


      tokens = stepper.tokenize('sleep 500')
      expect(tokens.length).equal(2, "No correct parsing 'sleep 500'")


      tokens = stepper.tokenize('key 1')
      expect(tokens.length).equal(2, "No correct parsing 'key 1'")


      tokens = stepper.tokenize('focus "[name=q]"')
      console.log(tokens)
      expect(tokens.length).equal(2, "No correct parsing 'focus [name=q]'")


      tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200')
      console.log(tokens)
      expect(tokens.length).equal(3, "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200'")


      tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200 500')
      console.log(tokens)
      expect(tokens.length).equal(4, "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200 500'")
  });

  it('parser2', function() {
    
    const listener = Container.get<Listener>(Listener);
    const api = Container.get<Api>(Api);
    const stepper = Container.get<Stepper>(Stepper);


    
    let tokens = stepper.expand([{
      opcode: 'text',
      params: ['Javier Cabrera Arteaga', '400', '800']
    }])
    console.log(tokens)
});

  it('Run', function() {
      
    var j = schedule.scheduleJob("*/5 * * * *", () => {

      console.log("Running...")
      main.run(30, `test${Date.now()}`, 2000, (tab) => {

        const url = tab.webSocketDebuggerUrl;
            
        const ws = new WebSocket(url);
  
        listener.setup(ws, () => {
            console.log("Websocket channel opened. Enabling runtime namespace")
          
            recorder.start("test", 100)
            snapshotRecorder.start("test", 100);
            networkRecorder.start("test")
  
            listener.sendAndRegister({method: "Runtime.enable"})
            listener.sendAndRegister({method: "Page.enable"})
  
  
            profileRecorder.start()
  
            stepper.execute(`
              goto https://www.google.com
              focus [name=q]
              sleep 2000
              
              text 'KTH' 200 400
  
              sleep 500
  
              key Enter
  
              sleep 500
            `, "test", 5000)
          })
  
  
      
      })

    });

  });


});
