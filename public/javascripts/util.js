const crypto = require('crypto');

class Util {
  constructor() {
  }

  formatDate(dateString, locale) {
      if (dateString == null || dateString.length == 0)
        return '';

      var date = new Date(dateString);
      var d = date.getDate();
      var m = date.getMonth();
      var month = '';
      var y = date.getFullYear();

      if (d < 10)
        d = new String( "0" + d.toString() );
      else
        d = new String( d.toString() );

      m++; // 0 -> 11
      if (m < 10)
        month = new String( "0" + m.toString() );
      else
        month = new String( m.toString() );

      m--;

      switch (locale) {
        case 'pt-br':
          //var monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          //var formatedDate = d + '-' + monthNames[m] + '-' + y;
          var formatedDate = d + '/' + month + '/' + y;
          break;
        case 'en-us':
          //var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          //var formatedDate = y + '-' + monthNames[m] + '-' + d;
          var formatedDate = y + '-' + month + '-' + d;
          break;
        default:
          var formatedDate = d + '/' + month + '/' + y;
          break;
      };    
      return formatedDate;
  }

  formatDateDB(dateString, dbServer) {
    if (dateString == null || dateString.length == 0)
      return '';

    var formatedDate;
    formatedDate = dateString.substr(6,4) + '-' + dateString.substr(3,2) + '-' + dateString.substr(0,2);
    
    return formatedDate;
  }

  encrypt(algorithm, password, text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }
   
  decrypt(algorithm, password, text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  randomEncrypt(algorithm, encryptionKey, ivLength, text) {
    let iv = crypto.randomBytes(ivLength);
    let cipher = crypto.createCipheriv(algorithm, new Buffer(encryptionKey), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return iv.toString('hex') + ':' + encrypted.toString('hex');
   }
   
   randomDecrypt(algorithm, encryptionKey, text) {
    let textParts = text.split(':');
    let iv = new Buffer(textParts.shift(), 'hex');
    let encryptedText = new Buffer(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, new Buffer(encryptionKey), iv);
    let decrypted = decipher.update(encryptedText);
   
    decrypted = Buffer.concat([decrypted, decipher.final()]);
   
    return decrypted.toString();
   }
}

module.exports = Util;
