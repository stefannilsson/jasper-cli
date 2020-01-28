const packageJson = require('../package.json');

// TODO: 
class Jasper {
  constructor(API_USERNAME, API_KEY, API_HOSTNAME) {
    this.authorizationHeader = Buffer.from(`${API_USERNAME}:${API_KEY}`).toString('base64');
    this.hostname = API_HOSTNAME;
    this.userAgent = `jasper-cli/${packageJson.version} (node ${process.version})`;
  }

  devices() {
    const self = this;

      return new Promise((resolve, reject) => {
        // request List ICCIDs 
        (function(callback) {
          'use strict';
          try {
            const httpTransport = require('https');
            const responseEncoding = 'utf8';
            const httpOptions = {
                hostname: self.hostname,
                port: '443',
                path: '/rws/api/v1/devices?modifiedSince=2019-07-01T00:01:01%2B00:00&pageSize=100000&pageNumber=1',
                method: 'GET',
                headers: {"Authorization":`Basic ${self.authorizationHeader}`}
            };
            httpOptions.headers['User-Agent'] = self.userAgent;
    
            const request = httpTransport.request(httpOptions, (res) => {
                let responseBufs = [];
                let responseStr = '';
                
                res.on('data', (chunk) => {
                    if (Buffer.isBuffer(chunk)) {
                        responseBufs.push(chunk);
                    }
                    else {
                        responseStr = responseStr + chunk;            
                    }
                }).on('end', () => {
                    responseStr = responseBufs.length > 0 ? 
                        Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                    
                    callback(null, res.statusCode, res.headers, responseStr);
                });
                
            })
            .setTimeout(0)
            .on('error', (error) => {
                reject(error);
            });
            request.write("")
            request.end();
          }
          catch(e) {
            console.log('"OHHH"')
          }
        })((error, statusCode, headers, body) => {
          if(statusCode == 200) {
            resolve(JSON.parse(body));
          }
          else if(statusCode == 401) {
            reject({errno: 'ACCESS_DENIED'});
          }
          else {
            console.log(`ERROR: In device() - ${statusCode} (${error})`);
            reject(error);
          }
        });
      });
  }

  /**
   * 
   * @param {String} iccid The ICCID to extract details of.
   */
  deviceInfo(iccid) {
    const self = this;
    return new Promise((resolve, reject) => {
      // request List ICCIDs 
      (function(callback) {
        'use strict';
            
        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: self.hostname,
            port: '443',
            path: `/rws/api/v1/devices/${iccid}`,
            method: 'GET',
            headers: {"Authorization":`Basic ${self.authorizationHeader}`}
        };
        httpOptions.headers['User-Agent'] = self.userAgent;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';
            
            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;            
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ? 
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                
                callback(null, res.statusCode, res.headers, responseStr);
            });
            
        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("")
        request.end();
      })((error, statusCode, headers, body) => {
        if(!error) {
          // append sessionInfo before resolving details Promise.
          var details = JSON.parse(body);
          self.sessionInfo(details.iccid).then((sessionInfo) => {
            self.ctdUsages(details.iccid).then((ctd) => {
              // get rid of ms + verbose timezone.
              if(sessionInfo.dateSessionStarted) sessionInfo.dateSessionStarted = sessionInfo.dateSessionStarted.substring(0,19) + 'Z';
              if(sessionInfo.dateSessionEnded) sessionInfo.dateSessionEnded = sessionInfo.dateSessionEnded.substring(0,19) + 'Z';
              
              // bytes -> MB
              ctd.ctdDataUsage = Math.round(ctd.ctdDataUsage / (1000*1000) * 10, 1) / 10.0;

              // Merge ICCID's device details + ctdUsage + sessionInfo properties.
              details = {
                ...details,
                ...ctd,
                ...sessionInfo,
              }
              resolve(details);
            })
          })
        }
        else {
          console.log(`ERROR: In details() - ${statusCode} (${error})`);
          reject(error);
        }
      });
    });
  }

  sessionInfo(iccid) {
    const self = this;
    return new Promise((resolve, reject) => {
      // request SessioInfo
      (function(callback) {
        'use strict';
            
        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: self.hostname,
            port: '443',
            path: `/rws/api/v1/devices/${iccid}/sessionInfo`,
            method: 'GET',
            headers: {"Authorization":`Basic ${self.authorizationHeader}`}
        };
        httpOptions.headers['User-Agent'] = self.userAgent;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';
            
            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;            
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ? 
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                
                callback(null, res.statusCode, res.headers, responseStr);
            });
            
        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("")
        request.end();
      })((error, statusCode, headers, body) => {
        if(!error) {
          resolve(JSON.parse(body));
        }
        else {
          console.log(`ERROR: In sessionInfo() - ${statusCode} (${error})`);
          reject(error);
        }
      });
    });
  }

  ctdUsages(iccid) {
    const self = this;
    return new Promise((resolve, reject) => {
      // request SessioInfo
      (function(callback) {
        'use strict';
            
        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: self.hostname,
            port: '443',
            path: `/rws/api/v1/devices/${iccid}/ctdUsages`,
            method: 'GET',
            headers: {"Authorization":`Basic ${self.authorizationHeader}`}
        };
        httpOptions.headers['User-Agent'] = self.userAgent;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';
            
            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ? 
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                
                callback(null, res.statusCode, res.headers, responseStr);
            });
            
        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("")
        request.end();
      })((error, statusCode, headers, body) => {
        if(!error) {
          resolve(JSON.parse(body));
        }
        else {
          console.log(`ERROR: In ctdUsages() - ${statusCode} (${error})`);
          reject(error);
        }
      });
    });
  }
}

module.exports = Jasper;
