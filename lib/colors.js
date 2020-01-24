class Colors {
  constructor(nocolor) {
    if(nocolor) {
      this.constants = {
        Reset: "",
        Bright: "",
        Dim: "",
        Underscore: "",
        Blink: "",
        Reverse: "",
        Hidden: "",
      
        FgBlack: "",
        FgRed: "",
        FgGreen: "",
        FgYellow: "",
        FgBlue: "",
        FgMagenta: "",
        FgCyan: "",
        FgWhite: "",
      
        BgBlack: "",
        BgRed: "",
        BgGreen: "",
        BgYellow: "",
        BgBlue: "",
        BgMagenta: "",
        BgCyan: "",
        BgWhite: "",  
      }
    }
    else {
      this.constants = {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
      
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
      
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",  
      }
    }
  }

  

  colorize(text) {
      const regexpActivationReadyOrDeactivated = /ACTIVATION_READY|DEACTIVATED/;
      const regexpSessionEnded = /\s20[1-9][0-9]\-[0-9][0-9]\-[0-9][0-9].*\s20[1-9][0-9]\-[0-9][0-9]\-[0-9][0-9] [0-9:Z]+$/;
  
      // ACTIONVATION_READY or DEACTIVATED (GREY)
      if(regexpActivationReadyOrDeactivated.exec(text)) {
        return this.constants.Dim + text + this.constants.Reset;
      }
      // Session ended (RED)
      else if(regexpSessionEnded.exec(text)) {
        return this.constants.FgRed + text + this.constants.Reset;
      }
      // Otherwise (GREEN)
      else {
        return this.constants.Reset + this.constants.FgGreen + text + this.constants.Reset;
      }
    }

}
module.exports = Colors;